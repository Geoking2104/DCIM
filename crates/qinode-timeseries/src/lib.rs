//! Palier B : même tables que `web/lib/clickhouse.ts`.

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum TsError {
    #[error("clickhouse: {0}")]
    Http(String),
}

#[derive(Clone)]
pub struct ClickHouse {
    url: String,
    db: String,
}

impl ClickHouse {
    pub fn from_env() -> Self {
        Self {
            url: std::env::var("CLICKHOUSE_URL").unwrap_or_else(|_| "http://127.0.0.1:8123".into()),
            db: std::env::var("CLICKHOUSE_DB").unwrap_or_else(|_| "dcim".into()),
        }
    }

    pub async fn exec(&self, sql: &str) -> Result<String, TsError> {
        let res = reqwest::Client::new()
            .post(&self.url)
            .header("content-type", "text/plain")
            .body(sql.to_string())
            .send()
            .await
            .map_err(|e| TsError::Http(e.to_string()))?;
        let status = res.status();
        let text = res.text().await.unwrap_or_default();
        if !status.is_success() {
            return Err(TsError::Http(format!("{status} {text}")));
        }
        Ok(text)
    }

    pub async fn ensure_schema(&self) -> Result<(), TsError> {
        self.exec(&format!("CREATE DATABASE IF NOT EXISTS {}", self.db))
            .await?;
        self.exec(&format!(
            "CREATE TABLE IF NOT EXISTS {}.power_metrics (
                timestamp DateTime DEFAULT now(),
                rack_id String,
                grid_power_kw Float64,
                ups_power_kw Float64,
                pdu_power_kw Float64,
                rack_power_kw Float64,
                battery_cell_temp Float64,
                voltage Float64
            ) ENGINE = MergeTree ORDER BY (rack_id, timestamp)",
            self.db
        ))
        .await?;
        Ok(())
    }

    pub async fn insert_power(&self, row: &PowerSample) -> Result<(), TsError> {
        let sql = format!(
            "INSERT INTO {}.power_metrics (rack_id, grid_power_kw, ups_power_kw, pdu_power_kw, rack_power_kw, battery_cell_temp, voltage) VALUES ('{}', {}, {}, {}, {}, {}, {})",
            self.db,
            row.rack_id.replace('\\', "").replace('\'', ""),
            row.grid_kw,
            row.ups_kw,
            row.pdu_kw,
            row.rack_kw,
            row.cell_temp,
            row.voltage
        );
        self.exec(&sql).await?;
        Ok(())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PowerSample {
    pub rack_id: String,
    pub grid_kw: f64,
    pub ups_kw: f64,
    pub pdu_kw: f64,
    pub rack_kw: f64,
    pub cell_temp: f64,
    pub voltage: f64,
}
