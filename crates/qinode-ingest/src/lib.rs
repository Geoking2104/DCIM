//! Palier B : découverte BMC via [libredfish](https://crates.io/crates/libredfish).
//! Lecture seule (pas de reset / power control exposé).

use libredfish::{Endpoint, Redfish, RedfishClientPool};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum IngestError {
    #[error("redfish: {0}")]
    Redfish(String),
}

#[derive(Debug, Clone, Deserialize)]
pub struct BmcTarget {
    pub host: String,
    pub port: Option<u16>,
    pub user: Option<String>,
    pub password: Option<String>,
}

impl From<BmcTarget> for Endpoint {
    fn from(t: BmcTarget) -> Self {
        Endpoint {
            host: t.host,
            port: t.port,
            user: t.user,
            password: t.password,
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct RedfishSnapshot {
    pub host: String,
    pub power_state: String,
    pub systems: Vec<String>,
    pub managers: Vec<String>,
    pub power: Option<String>,
    pub thermal: Option<String>,
    pub official: bool,
}

pub async fn snapshot(target: BmcTarget) -> Result<RedfishSnapshot, IngestError> {
    let host = target.host.clone();
    let pool = RedfishClientPool::builder()
        .build()
        .map_err(|e| IngestError::Redfish(e.to_string()))?;
    let client = pool
        .create_client(target.into())
        .await
        .map_err(|e| IngestError::Redfish(e.to_string()))?;

    let power_state = client
        .get_power_state()
        .await
        .map(|s| format!("{s:?}"))
        .unwrap_or_else(|e| format!("indisponible:{e}"));
    let systems = client.get_systems().await.unwrap_or_default();
    let managers = client.get_managers().await.unwrap_or_default();
    let power = client
        .get_power_metrics()
        .await
        .ok()
        .map(|p| format!("{p:?}"));
    let thermal = client
        .get_thermal_metrics()
        .await
        .ok()
        .map(|t| format!("{t:?}"));

    Ok(RedfishSnapshot {
        host,
        power_state,
        systems,
        managers,
        power,
        thermal,
        official: false,
    })
}
