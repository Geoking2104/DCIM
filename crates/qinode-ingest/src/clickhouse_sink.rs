//! Sink ClickHouse du rejeu : idempotence par reçus de lot.
//!
//! Chaque lot rejoué est inscrit dans `<db>.ingest_spool_receipts` avant d'être
//! considéré comme consommé ; un renvoi du même lot (rejeu après panne) est
//! détecté et renvoyé en [`SinkAck::Duplicate`].
//!
//! Limite documentée : en cas d'arrêt brutal entre l'insertion des lignes et
//! l'écriture du reçu, le rejeu suivant peut réinsérer ce lot (fenêtre
//! résiduelle « au moins une fois »). Pour une garantie stricte, activer
//! `insert_deduplication_token` sur une table répliquée côté ClickHouse.

use crate::spool::{SinkAck, SpoolRecord, TelemetrySink};
use crate::IngestError;

/// Exécuteur SQL minimal (ClickHouse HTTP ou doublure de test).
#[allow(async_fn_in_trait)]
pub trait QueryExecutor {
    async fn exec(&self, sql: &str) -> Result<String, IngestError>;
}

/// Exécuteur ClickHouse HTTP (`CLICKHOUSE_URL`, `CLICKHOUSE_DB`).
pub struct ClickHouseHttp {
    url: String,
    database: String,
}

impl ClickHouseHttp {
    pub fn from_env() -> Self {
        Self {
            url: std::env::var("CLICKHOUSE_URL").unwrap_or_else(|_| "http://127.0.0.1:8123".into()),
            database: std::env::var("CLICKHOUSE_DB").unwrap_or_else(|_| "dcim".into()),
        }
    }

    pub fn new(url: &str, database: &str) -> Self {
        Self {
            url: url.to_string(),
            database: database.to_string(),
        }
    }
}

impl QueryExecutor for ClickHouseHttp {
    async fn exec(&self, sql: &str) -> Result<String, IngestError> {
        let response = reqwest::Client::new()
            .post(format!("{}?database={}", self.url, self.database))
            .header("content-type", "text/plain")
            .body(sql.to_string())
            .send()
            .await
            .map_err(|error| IngestError::ClickHouse(error.to_string()))?;
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        if !status.is_success() {
            return Err(IngestError::ClickHouse(format!("{status} {text}")));
        }
        Ok(text)
    }
}

/// Sink générique : envoie les lots `power_metrics` et tient le registre de reçus.
pub struct BatchClickHouseSink<E: QueryExecutor> {
    exec: E,
    database: String,
}

impl<E: QueryExecutor> BatchClickHouseSink<E> {
    pub fn new(exec: E, database: &str) -> Self {
        Self {
            exec,
            database: database.to_string(),
        }
    }

    /// Crée le registre de reçus s'il n'existe pas encore.
    pub async fn ensure_schema(&self) -> Result<(), IngestError> {
        self.exec
            .exec(&format!(
                "CREATE TABLE IF NOT EXISTS {}.ingest_spool_receipts (
                    batch_id String,
                    record_count UInt32,
                    received_at DateTime DEFAULT now()
                ) ENGINE = MergeTree ORDER BY batch_id",
                self.database
            ))
            .await?;
        Ok(())
    }
}

impl<E: QueryExecutor> TelemetrySink for BatchClickHouseSink<E> {
    async fn send_batch(
        &self,
        batch_id: &str,
        rows: &[SpoolRecord],
    ) -> Result<SinkAck, IngestError> {
        let id = batch_id.replace(['\\', '\''], "");
        let existing = self
            .exec
            .exec(&format!(
                "SELECT count() FROM {}.ingest_spool_receipts WHERE batch_id = '{}'",
                self.database, id
            ))
            .await?;
        if existing.trim() != "0" {
            return Ok(SinkAck::Duplicate);
        }
        let mut body = String::new();
        for row in rows {
            body.push_str(
                &serde_json::to_string(&row.payload)
                    .map_err(|error| IngestError::Io(error.to_string()))?,
            );
            body.push('\n');
        }
        self.exec
            .exec(&format!(
                "INSERT INTO {}.power_metrics (rack_id, grid_power_kw, ups_power_kw, pdu_power_kw, rack_power_kw, battery_cell_temp, voltage) FORMAT JSONEachRow\n{}",
                self.database, body
            ))
            .await?;
        self.exec
            .exec(&format!(
                "INSERT INTO {}.ingest_spool_receipts (batch_id, record_count) VALUES ('{}', {})",
                self.database,
                id,
                rows.len()
            ))
            .await?;
        Ok(SinkAck::Stored)
    }
}
