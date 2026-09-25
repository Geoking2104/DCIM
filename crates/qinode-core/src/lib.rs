//! Domain Qinode : chiffres salle (aperçu, jamais un tampon officiel).

use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum MetricError {
    #[error("electricite machines manquante ou nulle")]
    MissingItEnergy,
    #[error("les machines ne peuvent pas consommer plus que la salle")]
    ItExceedsFacility,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PueInput {
    pub facility_kwh: f64,
    pub it_kwh: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WueInput {
    pub water_liters: f64,
    pub it_kwh: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetricPreview {
    pub kind: String,
    pub value: f64,
    pub band: String,
    pub official: bool,
}

impl MetricPreview {
    fn pue(value: f64) -> Self {
        let band = if value < 1.2 {
            "tres_efficace"
        } else if value < 1.4 {
            "bon"
        } else if value < 1.7 {
            "moyen"
        } else {
            "a_travailler"
        };
        Self {
            kind: "pue".into(),
            value,
            band: band.into(),
            official: false,
        }
    }

    fn wue(value: f64) -> Self {
        let band = if value < 0.2 {
            "tres_sobre"
        } else if value < 1.0 {
            "raisonnable"
        } else {
            "gourmand"
        };
        Self {
            kind: "wue".into(),
            value,
            band: band.into(),
            official: false,
        }
    }
}

pub fn pue(input: PueInput) -> Result<MetricPreview, MetricError> {
    if input.it_kwh <= 0.0 {
        return Err(MetricError::MissingItEnergy);
    }
    if input.facility_kwh < input.it_kwh {
        return Err(MetricError::ItExceedsFacility);
    }
    Ok(MetricPreview::pue(input.facility_kwh / input.it_kwh))
}

pub fn wue(input: WueInput) -> Result<MetricPreview, MetricError> {
    if input.it_kwh <= 0.0 {
        return Err(MetricError::MissingItEnergy);
    }
    Ok(MetricPreview::wue(input.water_liters / input.it_kwh))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pue_ok() {
        let p = pue(PueInput {
            facility_kwh: 130.0,
            it_kwh: 100.0,
        })
        .unwrap();
        assert!((p.value - 1.3).abs() < 1e-9);
        assert!(!p.official);
    }

    #[test]
    fn pue_rejects_inverted() {
        assert!(pue(PueInput {
            facility_kwh: 80.0,
            it_kwh: 100.0
        })
        .is_err());
    }
}
