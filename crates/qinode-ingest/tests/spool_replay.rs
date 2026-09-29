//! Tests du spool durable et du rejeu idempotent (NFR-REL-001).

use qinode_ingest::clickhouse_sink::{BatchClickHouseSink, QueryExecutor};
use qinode_ingest::spool::{
    batch_id, SinkAck, Spool, SpoolRecord, TelemetrySink, BATCH_MAX_RECORDS,
};
use qinode_ingest::IngestError;
use std::collections::HashMap;
use std::io::Write;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};

#[derive(Default)]
struct FakeSink {
    stored: Mutex<HashMap<String, usize>>,
    calls: Mutex<usize>,
    fail_at: Mutex<Option<usize>>,
}

impl FakeSink {
    fn failing_at(call_index: usize) -> Self {
        Self {
            stored: Mutex::new(HashMap::new()),
            calls: Mutex::new(0),
            fail_at: Mutex::new(Some(call_index)),
        }
    }

    fn stored_batches(&self) -> usize {
        self.stored.lock().unwrap().len()
    }

    fn stored_records(&self) -> usize {
        self.stored.lock().unwrap().values().sum()
    }
}

impl TelemetrySink for FakeSink {
    async fn send_batch(
        &self,
        batch_id: &str,
        rows: &[SpoolRecord],
    ) -> Result<SinkAck, IngestError> {
        let mut calls = self.calls.lock().unwrap();
        *calls += 1;
        if *self.fail_at.lock().unwrap() == Some(*calls) {
            return Err(IngestError::Io("panne simulée".into()));
        }
        drop(calls);
        let mut stored = self.stored.lock().unwrap();
        if stored.contains_key(batch_id) {
            Ok(SinkAck::Duplicate)
        } else {
            stored.insert(batch_id.to_string(), rows.len());
            Ok(SinkAck::Stored)
        }
    }
}

fn temp_dir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("qinode-spool-{}-{}", std::process::id(), name));
    let _ = std::fs::remove_dir_all(&dir);
    dir
}

#[tokio::test]
async fn replay_success_consumes_the_file() {
    let dir = temp_dir("success");
    let spool = Spool::open(&dir).expect("spool");
    let sink = FakeSink::default();
    for index in 0..5 {
        spool
            .append("pdu1", &serde_json::json!({ "index": index }))
            .expect("append");
    }
    let report = spool.replay("pdu1", &sink).await.expect("replay");
    assert_eq!(report.records_sent, 5);
    assert_eq!(report.remaining, 0);
    assert_eq!(report.failed_batches, 0);
    assert_eq!(sink.stored_records(), 5);
    assert_eq!(spool.pending("pdu1").expect("pending"), 0);
    let again = spool.replay("pdu1", &sink).await.expect("replay");
    assert_eq!(again.records_sent, 0);
}

#[tokio::test]
async fn outage_keeps_the_spool_and_replay_resumes_without_loss() {
    let dir = temp_dir("outage");
    let spool = Spool::open(&dir).expect("spool");
    let sink = FakeSink::failing_at(1);
    for index in 0..3 {
        spool
            .append("bms", &serde_json::json!({ "index": index }))
            .expect("append");
    }
    let failed = spool.replay("bms", &sink).await.expect("replay");
    assert_eq!(failed.failed_batches, 1);
    assert_eq!(failed.remaining, 3);
    assert!(failed.last_error.is_some());
    assert_eq!(spool.pending("bms").expect("pending"), 3);
    let resumed = spool.replay("bms", &sink).await.expect("replay");
    assert_eq!(resumed.records_sent, 3);
    assert_eq!(resumed.remaining, 0);
    assert_eq!(sink.stored_records(), 3);
}

#[tokio::test]
async fn retry_after_partial_success_deduplicates_batches() {
    let dir = temp_dir("dedupe");
    let spool = Spool::open(&dir).expect("spool");
    let total = BATCH_MAX_RECORDS + 10;
    for index in 0..total {
        spool
            .append("grid", &serde_json::json!({ "index": index }))
            .expect("append");
    }
    // Premier rejeu : le lot 1 passe, le lot 2 échoue (appel n°2).
    let sink = FakeSink::failing_at(2);
    let first = spool.replay("grid", &sink).await.expect("replay");
    assert_eq!(first.batches_sent, 1);
    assert_eq!(first.records_sent, BATCH_MAX_RECORDS);
    assert!(first.remaining > 0);
    // Second rejeu : le lot 1 revient en doublon, le lot 2 passe — ni perte ni double stockage.
    let second = spool.replay("grid", &sink).await.expect("replay");
    assert_eq!(second.duplicates, 1);
    assert_eq!(second.remaining, 0);
    assert_eq!(sink.stored_batches(), 2);
    assert_eq!(sink.stored_records(), total);
}

#[tokio::test]
async fn torn_last_line_is_ignored() {
    let dir = temp_dir("torn");
    let spool = Spool::open(&dir).expect("spool");
    spool
        .append("pdu2", &serde_json::json!({ "index": 0 }))
        .expect("append");
    spool
        .append("pdu2", &serde_json::json!({ "index": 1 }))
        .expect("append");
    {
        let path = dir.join("pdu2.jsonl");
        let mut file = std::fs::OpenOptions::new()
            .append(true)
            .open(path)
            .expect("open");
        file.write_all(b"{\"seq\":99,\"payload\":")
            .expect("écriture partielle");
    }
    let records = spool.read_all("pdu2").expect("read");
    assert_eq!(records.len(), 2);
    let seq = spool
        .append("pdu2", &serde_json::json!({ "index": 2 }))
        .expect("append");
    assert_eq!(seq, 3);
}

#[tokio::test]
async fn busy_spool_rejects_concurrent_replay() {
    let dir = temp_dir("busy");
    let spool = Spool::open(&dir).expect("spool");
    spool
        .append("pdu3", &serde_json::json!({ "index": 0 }))
        .expect("append");
    std::fs::write(dir.join("pdu3.lock"), "verrou manuel").expect("lock");
    let error = spool
        .replay("pdu3", &FakeSink::default())
        .await
        .expect_err("occupé");
    assert!(matches!(error, IngestError::SpoolBusy(_)));
}

#[test]
fn batch_identifiers_are_deterministic() {
    let rows: Vec<SpoolRecord> = (1..=3)
        .map(|seq| SpoolRecord {
            seq,
            payload: serde_json::json!({ "seq": seq }),
        })
        .collect();
    let copy = rows.clone();
    assert_eq!(batch_id("grid", &rows), batch_id("grid", &copy));
    assert_ne!(batch_id("grid", &rows), batch_id("pdu", &rows));
    assert_eq!(batch_id("grid", &[]), "grid:0:0:0");
}

#[derive(Default)]
struct ExecState {
    executed: Mutex<Vec<String>>,
    receipts: Mutex<Vec<String>>,
}

struct FakeExec {
    state: Arc<ExecState>,
}

impl QueryExecutor for FakeExec {
    async fn exec(&self, sql: &str) -> Result<String, IngestError> {
        self.state.executed.lock().unwrap().push(sql.to_string());
        if sql.starts_with("SELECT count() FROM") {
            let id = extract_quoted(sql).unwrap_or_default();
            let known = self
                .state
                .receipts
                .lock()
                .unwrap()
                .iter()
                .any(|receipt| receipt == &id);
            return Ok(if known { "1\n".into() } else { "0\n".into() });
        }
        if sql.contains("INSERT INTO") && sql.contains("ingest_spool_receipts") {
            if let Some(id) = extract_quoted(sql) {
                self.state.receipts.lock().unwrap().push(id);
            }
        }
        Ok(String::new())
    }
}

fn extract_quoted(sql: &str) -> Option<String> {
    let start = sql.find('\'')?;
    let rest = &sql[start + 1..];
    let end = rest.find('\'')?;
    Some(rest[..end].to_string())
}

#[tokio::test]
async fn clickhouse_sink_deduplicates_stored_batches() {
    let state = Arc::new(ExecState::default());
    let sink = BatchClickHouseSink::new(
        FakeExec {
            state: state.clone(),
        },
        "dcim",
    );
    let rows = vec![SpoolRecord {
        seq: 1,
        payload: serde_json::json!({
            "rack_id": "RACK-01",
            "grid_power_kw": 100.0,
            "ups_power_kw": 90.0,
            "pdu_power_kw": 80.0,
            "rack_power_kw": 50.0,
            "battery_cell_temp": 22.0,
            "voltage": 230.0,
        }),
    }];
    assert_eq!(
        sink.send_batch("grid:1:1:1", &rows).await.expect("premier"),
        SinkAck::Stored
    );
    assert_eq!(
        sink.send_batch("grid:1:1:1", &rows).await.expect("doublon"),
        SinkAck::Duplicate
    );
    let executed = state.executed.lock().unwrap();
    let inserts = executed
        .iter()
        .filter(|sql| sql.contains("INSERT INTO dcim.power_metrics"))
        .count();
    assert_eq!(inserts, 1);
    assert_eq!(state.receipts.lock().unwrap().len(), 1);
}
