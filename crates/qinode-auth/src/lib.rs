//! Même contrat que Nest `keycloak.service.ts` : JWKS + iss + aud `qinode-graphql`.

use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("bearer manquant")]
    Missing,
    #[error("jwt: {0}")]
    Jwt(String),
    #[error("audience refusee (attendu {0})")]
    Audience(String),
    #[error("jwks: {0}")]
    Jwks(String),
}

#[derive(Clone)]
pub struct Keycloak {
    issuer: String,
    audience: String,
    jwks_uri: String,
    optional: bool,
}

impl Keycloak {
    pub fn from_env() -> Self {
        let issuer = std::env::var("KEYCLOAK_ISSUER").unwrap_or_default().trim_end_matches('/').to_string();
        let jwks_uri = std::env::var("KEYCLOAK_JWKS_URI").unwrap_or_else(|_| {
            if issuer.is_empty() {
                String::new()
            } else {
                format!("{issuer}/protocol/openid-connect/certs")
            }
        });
        Self {
            issuer,
            audience: std::env::var("KEYCLOAK_AUDIENCE").unwrap_or_else(|_| "qinode-graphql".into()),
            jwks_uri,
            optional: std::env::var("KEYCLOAK_OPTIONAL").ok().as_deref() == Some("true"),
        }
    }

    pub fn required(&self) -> bool {
        !self.optional && !self.issuer.is_empty()
    }

    pub async fn verify_bearer(&self, header: Option<&str>) -> Result<serde_json::Value, AuthError> {
        if !self.required() {
            return Ok(serde_json::json!({"anonymous": true}));
        }
        let raw = header.and_then(|h| h.strip_prefix("Bearer ")).ok_or(AuthError::Missing)?;
        let kid = decode_header(raw).map_err(|e| AuthError::Jwt(e.to_string()))?.kid;
        let key = self.decoding_key(kid.as_deref()).await?;
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[&self.issuer]);
        validation.validate_aud = false;
        let data = decode::<serde_json::Value>(raw, &key, &validation).map_err(|e| AuthError::Jwt(e.to_string()))?;
        if !self.audience_ok(&data.claims) {
            return Err(AuthError::Audience(self.audience.clone()));
        }
        Ok(data.claims)
    }

    fn audience_ok(&self, claims: &serde_json::Value) -> bool {
        let want = &self.audience;
        match &claims["aud"] {
            serde_json::Value::String(s) if s == want => true,
            serde_json::Value::Array(a) if a.iter().any(|v| v.as_str() == Some(want)) => true,
            _ => {
                let azp = claims["azp"].as_str().unwrap_or("");
                std::env::var("KEYCLOAK_REQUIRE_AUD").ok().as_deref() == Some("false") && azp == "qinode-web"
            }
        }
    }

    async fn decoding_key(&self, kid: Option<&str>) -> Result<DecodingKey, AuthError> {
        #[derive(Deserialize)]
        struct Jwks {
            keys: Vec<Jwk>,
        }
        #[derive(Deserialize)]
        struct Jwk {
            kid: Option<String>,
            n: Option<String>,
            e: Option<String>,
        }
        let jwks: Jwks = reqwest::Client::new()
            .get(&self.jwks_uri)
            .send()
            .await
            .map_err(|e| AuthError::Jwks(e.to_string()))?
            .json()
            .await
            .map_err(|e| AuthError::Jwks(e.to_string()))?;
        let jwk = jwks
            .keys
            .iter()
            .find(|k| kid.map(|id| k.kid.as_deref() == Some(id)).unwrap_or(true))
            .ok_or_else(|| AuthError::Jwks("kid introuvable".into()))?;
        DecodingKey::from_rsa_components(jwk.n.as_deref().unwrap_or(""), jwk.e.as_deref().unwrap_or("AQAB"))
            .map_err(|e| AuthError::Jwks(e.to_string()))
    }
}
