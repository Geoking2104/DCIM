//! Rejoue un spool durable vers ClickHouse.
//! Usage : `replay_spool <répertoire> <source> [intervalle-ms]`
//!
//! `CLICKHOUSE_URL` / `CLICKHOUSE_DB` configurent la cible. Avec un intervalle,
//! le rejeu boucle (usage sidecar) ; sinon il s'exécute une fois.

use qinode_ingest::clickhouse_sink::{BatchClickHouseSink, ClickHouseHttp};
use qinode_ingest::spool::Spool;

#[tokio::main]
async fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("usage: replay_spool <répertoire> <source> [intervalle-ms]");
        std::process::exit(2);
    }
    let dir = &args[1];
    let source = &args[2];
    let interval_ms: u64 = args
        .get(3)
        .and_then(|value| value.parse().ok())
        .unwrap_or(0);
    let spool = Spool::open(dir).expect("ouverture du spool");
    let database = std::env::var("CLICKHOUSE_DB").unwrap_or_else(|_| "dcim".into());
    let sink = BatchClickHouseSink::new(ClickHouseHttp::from_env(), &database);
    if let Err(error) = sink.ensure_schema().await {
        eprintln!("schéma: {error}");
    }
    loop {
        match spool.replay(source, &sink).await {
            Ok(report) => {
                println!(
                    "replay {source}: lots={} envoyés={} doublons={} restants={} échecs={}",
                    report.batches_sent + report.duplicates,
                    report.records_sent,
                    report.duplicates,
                    report.remaining,
                    report.failed_batches
                );
                if let Some(error) = &report.last_error {
                    eprintln!("dernière erreur: {error}");
                }
            }
            Err(error) => eprintln!("replay: {error}"),
        }
        if interval_ms == 0 {
            break;
        }
        tokio::time::sleep(std::time::Duration::from_millis(interval_ms)).await;
    }
}
