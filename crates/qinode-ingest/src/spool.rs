//! Spool durable et rejeu idempotent pour la télémétrie (NFR-REL-001).
//!
//! Les collecteurs écrivent des enregistrements JSONL append-only ; un rejeu
//! périodique pousse les lots vers ClickHouse. Le rejeu est sûr après panne :
//! - un fichier n'est supprimé qu'après succès **complet** du rejeu ;
//! - après une panne partielle, le fichier est conservé tel quel et le rejeu
//!   suivant renvoie exactement les mêmes identifiants de lot — le sink refuse
//!   les doublons (contrat d'idempotence de [`TelemetrySink`]) ;
//! - une dernière ligne partielle (écriture interrompue) est ignorée à la lecture ;
//! - un verrou empêche deux rejeux simultanés sur la même source.

use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};

use crate::IngestError;

/// Taille maximale d'un lot de rejeu.
pub const BATCH_MAX_RECORDS: usize = 200;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SpoolRecord {
    pub seq: u64,
    pub payload: serde_json::Value,
}

/// Ligne de télémétrie puissance alignée sur les colonnes ClickHouse
/// (`power_metrics`), pour un envoi `JSONEachRow` sans transformation.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerSpoolRow {
    pub rack_id: String,
    pub grid_power_kw: f64,
    pub ups_power_kw: f64,
    pub pdu_power_kw: f64,
    pub rack_power_kw: f64,
    pub battery_cell_temp: f64,
    pub voltage: f64,
}

#[derive(Debug, Default, PartialEq)]
pub struct ReplayReport {
    pub batches_sent: usize,
    pub records_sent: usize,
    pub duplicates: usize,
    pub remaining: usize,
    pub failed_batches: usize,
    pub last_error: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SinkAck {
    /// Lot effectivement stocké.
    Stored,
    /// Lot déjà stocké lors d'une tentative précédente (rejeu après panne).
    Duplicate,
}

/// Contrat d'idempotence : renvoyer le même `batch_id` ne doit jamais
/// dupliquer les données côté sink ; le sink répond [`SinkAck::Duplicate`].
#[allow(async_fn_in_trait)]
pub trait TelemetrySink {
    async fn send_batch(
        &self,
        batch_id: &str,
        rows: &[SpoolRecord],
    ) -> Result<SinkAck, IngestError>;
}

pub struct Spool {
    root: PathBuf,
}

impl Spool {
    pub fn open(root: impl AsRef<Path>) -> Result<Self, IngestError> {
        fs::create_dir_all(root.as_ref()).map_err(|error| IngestError::Io(error.to_string()))?;
        Ok(Self {
            root: root.as_ref().to_path_buf(),
        })
    }

    pub fn root(&self) -> &Path {
        &self.root
    }

    fn file_path(&self, source: &str) -> PathBuf {
        self.root.join(format!("{}.jsonl", sanitize(source)))
    }

    fn lock_path(&self, source: &str) -> PathBuf {
        self.root.join(format!("{}.lock", sanitize(source)))
    }

    /// Ajoute un échantillon et renvoie sa séquence.
    pub fn append<T: Serialize>(&self, source: &str, payload: &T) -> Result<u64, IngestError> {
        let path = self.file_path(source);
        let seq = read_records(&path)?
            .last()
            .map(|record| record.seq)
            .unwrap_or(0)
            + 1;
        let record = SpoolRecord {
            seq,
            payload: serde_json::to_value(payload)
                .map_err(|error| IngestError::Io(error.to_string()))?,
        };
        let line =
            serde_json::to_string(&record).map_err(|error| IngestError::Io(error.to_string()))?;
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&path)
            .map_err(|error| IngestError::Io(error.to_string()))?;
        writeln!(file, "{line}").map_err(|error| IngestError::Io(error.to_string()))?;
        file.sync_all()
            .map_err(|error| IngestError::Io(error.to_string()))?;
        Ok(seq)
    }

    pub fn read_all(&self, source: &str) -> Result<Vec<SpoolRecord>, IngestError> {
        read_records(&self.file_path(source))
    }

    /// Nombre d'enregistrements en attente de rejeu.
    pub fn pending(&self, source: &str) -> Result<usize, IngestError> {
        Ok(self.read_all(source)?.len())
    }

    /// Rejoue la source vers le sink. Sans perte : le fichier n'est supprimé
    /// qu'après un succès complet ; sinon il est conservé pour la tentative
    /// suivante, où les lots déjà stockés reviennent en `Duplicate`.
    pub async fn replay<S: TelemetrySink>(
        &self,
        source: &str,
        sink: &S,
    ) -> Result<ReplayReport, IngestError> {
        let _lock = SpoolLock::acquire(&self.lock_path(source))?;
        let records = self.read_all(source)?;
        let total = records.len();
        let mut report = ReplayReport::default();
        let mut offset = 0;
        while offset < total {
            let end = (offset + BATCH_MAX_RECORDS).min(total);
            let chunk = &records[offset..end];
            let id = batch_id(source, chunk);
            match sink.send_batch(&id, chunk).await {
                Ok(SinkAck::Stored) => {
                    report.batches_sent += 1;
                    report.records_sent += chunk.len();
                    offset = end;
                }
                Ok(SinkAck::Duplicate) => {
                    report.duplicates += 1;
                    offset = end;
                }
                Err(error) => {
                    report.failed_batches += 1;
                    report.last_error = Some(error.to_string());
                    break;
                }
            }
        }
        if report.failed_batches == 0 && offset == total && total > 0 {
            fs::remove_file(self.file_path(source))
                .map_err(|error| IngestError::Io(error.to_string()))?;
        }
        report.remaining = total - offset;
        Ok(report)
    }
}

/// Identifiant déterministe d'un lot : un renvoi produit le même identifiant.
pub fn batch_id(source: &str, rows: &[SpoolRecord]) -> String {
    match (rows.first(), rows.last()) {
        (Some(first), Some(last)) => format!("{source}:{}:{}:{}", first.seq, last.seq, rows.len()),
        _ => format!("{source}:0:0:0"),
    }
}

fn sanitize(source: &str) -> String {
    source
        .chars()
        .map(|character| {
            if character.is_ascii_alphanumeric() || character == '-' || character == '_' {
                character
            } else {
                '_'
            }
        })
        .collect()
}

fn read_records(path: &Path) -> Result<Vec<SpoolRecord>, IngestError> {
    if !path.exists() {
        return Ok(Vec::new());
    }
    let file = fs::File::open(path).map_err(|error| IngestError::Io(error.to_string()))?;
    let mut records = Vec::new();
    for line in BufReader::new(file).lines() {
        let line = line.map_err(|error| IngestError::Io(error.to_string()))?;
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        match serde_json::from_str::<SpoolRecord>(trimmed) {
            Ok(record) => records.push(record),
            // Dernière ligne partielle (écriture interrompue) : on s'arrête là.
            Err(_) => break,
        }
    }
    Ok(records)
}

struct SpoolLock {
    path: PathBuf,
}

impl SpoolLock {
    fn acquire(path: &Path) -> Result<Self, IngestError> {
        match OpenOptions::new().create_new(true).write(true).open(path) {
            Ok(mut file) => {
                let _ = writeln!(file, "{}", std::process::id());
                Ok(Self {
                    path: path.to_path_buf(),
                })
            }
            Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => Err(
                IngestError::SpoolBusy(format!("rejeu déjà en cours pour {}", path.display())),
            ),
            Err(error) => Err(IngestError::Io(error.to_string())),
        }
    }
}

impl Drop for SpoolLock {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
    }
}
