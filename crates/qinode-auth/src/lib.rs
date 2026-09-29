//! Même contrat que Nest `keycloak.service.ts` : JWKS + iss + aud `qinode-graphql`.
//!
//! Durcissement P1 : cache JWKS avec rafraîchissement à la rotation de clé,
//! extraction d'un [`Principal`] (sujet, tenants, rôles) et vérification
//! fail-closed d'appartenance tenant pour les tests négatifs inter-tenants.

use jsonwebtoken::{decode, decode_header, Algorithm, DecodingKey, Validation};
use serde::Deserialize;
use serde_json::Value;
use std::collections::{BTreeMap, BTreeSet};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
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
    #[error("configuration: {0}")]
    Configuration(String),
    #[error("tenant hors perimetre: {0}")]
    Tenant(String),
}

/// Identité minimale propagée dans le contexte GraphQL du gateway.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Principal {
    pub subject: String,
    pub tenants: Vec<String>,
    pub roles: Vec<String>,
    pub anonymous: bool,
}

impl Principal {
    pub fn anonymous() -> Self {
        Self {
            subject: "anonymous".into(),
            tenants: Vec::new(),
            roles: Vec::new(),
            anonymous: true,
        }
    }

    pub fn is_admin(&self) -> bool {
        self.roles.iter().any(|role| role == "qinode-admin")
    }

    /// Fail-closed : hors admin, l'utilisateur doit lister explicitement le tenant.
    /// (`KEYCLOAK_OPTIONAL=true` reste ouvert pour le développement local.)
    pub fn tenant_allowed(&self, tenant: &str) -> bool {
        if self.anonymous || self.is_admin() {
            return true;
        }
        self.tenants.iter().any(|listed| listed == tenant)
    }
}

pub fn ensure_tenant_allowed(principal: &Principal, tenant: &str) -> Result<(), AuthError> {
    if principal.tenant_allowed(tenant) {
        Ok(())
    } else {
        Err(AuthError::Tenant(tenant.to_string()))
    }
}

/// Catalogue tenant → site (source : `TENANT_CATALOG`, JSON
/// `[{"slug":"paris-east","siteId":"site-paris-01"}, …]`).
///
/// C'est le pont entre les tenants des jetons Keycloak et les périmètres des
/// données (un rack porte un `site_id`). Sans entrée — ou sans catalogue —
/// l'identité est utilisée : le slug du tenant vaut alors l'identifiant de site.
/// Le périmètre obtenu est **borné et ordonné** ; sans tenant listé il est vide
/// (fail-closed).
#[derive(Debug, Clone, Default)]
pub struct TenantCatalog {
    sites: BTreeMap<String, String>,
}

#[derive(Deserialize)]
struct TenantCatalogEntry {
    #[serde(default)]
    slug: Option<String>,
    #[serde(default)]
    tenant: Option<String>,
    #[serde(default, rename = "siteId")]
    site_id: Option<String>,
}

impl TenantCatalog {
    pub fn from_json(raw: &str) -> Self {
        let mut sites = BTreeMap::new();
        if let Ok(entries) = serde_json::from_str::<Vec<TenantCatalogEntry>>(raw) {
            for entry in entries {
                let slug = entry
                    .slug
                    .or(entry.tenant)
                    .map(|value| value.trim().to_string())
                    .filter(|value| !value.is_empty());
                if let Some(slug) = slug {
                    let site = entry
                        .site_id
                        .map(|value| value.trim().to_string())
                        .filter(|value| !value.is_empty())
                        .unwrap_or_else(|| slug.clone());
                    sites.insert(slug, site);
                }
            }
        }
        Self { sites }
    }

    pub fn from_env() -> Self {
        Self::from_json(&std::env::var("TENANT_CATALOG").unwrap_or_default())
    }

    /// Site associé au tenant (identité si absent du catalogue).
    pub fn site_for(&self, tenant: &str) -> String {
        self.sites
            .get(tenant)
            .cloned()
            .unwrap_or_else(|| tenant.to_string())
    }

    /// Ensemble des sites autorisés pour une liste de tenants.
    pub fn sites_for<S: AsRef<str>>(&self, tenants: &[S]) -> BTreeSet<String> {
        tenants
            .iter()
            .map(|tenant| self.site_for(tenant.as_ref()))
            .collect()
    }

    pub fn len(&self) -> usize {
        self.sites.len()
    }

    pub fn is_empty(&self) -> bool {
        self.sites.is_empty()
    }
}

#[cfg(test)]
mod tenant_catalog_tests {
    use super::*;

    #[test]
    fn catalog_maps_slugs_and_falls_back_to_identity() {
        let catalog = TenantCatalog::from_json(
            r#"[{"slug":"paris-east","siteId":"site-paris-01"},{"tenant":"lille","siteId":"site-lille-01"},{"slug":"sans-site"}]"#,
        );
        assert_eq!(catalog.len(), 3);
        assert_eq!(catalog.site_for("paris-east"), "site-paris-01");
        assert_eq!(catalog.site_for("lille"), "site-lille-01");
        assert_eq!(catalog.site_for("sans-site"), "sans-site");
        assert_eq!(catalog.site_for("inconnu"), "inconnu");

        let sites = catalog.sites_for(&["paris-east", "inconnu"]);
        assert_eq!(sites.len(), 2);
        assert!(sites.contains("site-paris-01"));
        assert!(sites.contains("inconnu"));

        let empty: Vec<String> = Vec::new();
        assert!(catalog.sites_for(&empty).is_empty());
    }

    #[test]
    fn catalog_tolerates_invalid_json() {
        assert!(TenantCatalog::from_json("pas du json").is_empty());
        assert!(TenantCatalog::from_json("").is_empty());
        assert!(TenantCatalog::from_json("{\"slug\":\"x\"}").is_empty());
    }
}

/// Extraction des tenants depuis les groupes Keycloak (`/tenants/<id>/…`).
pub fn tenants_from_groups<S: AsRef<str>>(groups: &[S]) -> Vec<String> {
    let mut out = BTreeSet::new();
    for group in groups {
        let parts: Vec<&str> = group
            .as_ref()
            .split('/')
            .filter(|part| !part.is_empty())
            .collect();
        if let Some(index) = parts
            .iter()
            .position(|part| *part == "tenants" || *part == "tenant")
        {
            if let Some(tenant) = parts.get(index + 1) {
                out.insert((*tenant).to_string());
            }
        }
    }
    out.into_iter().collect()
}

/// Rôles `qinode-*` depuis realm_access + resource_access (client web ou API).
pub fn roles_from_claims(claims: &Value) -> Vec<String> {
    let mut out = BTreeSet::new();
    push_qinode_roles(&mut out, claims["realm_access"]["roles"].as_array());
    let client_id = std::env::var("KEYCLOAK_CLIENT_ID").unwrap_or_else(|_| "qinode-web".into());
    if let Some(clients) = claims["resource_access"].as_object() {
        for key in [client_id.as_str(), "qinode-graphql"] {
            if let Some(entry) = clients.get(key) {
                push_qinode_roles(&mut out, entry["roles"].as_array());
            }
        }
    }
    out.into_iter().collect()
}

fn push_qinode_roles(out: &mut BTreeSet<String>, roles: Option<&Vec<Value>>) {
    if let Some(roles) = roles {
        for role in roles {
            if let Some(name) = role.as_str() {
                if name.starts_with("qinode-") {
                    out.insert(name.to_string());
                }
            }
        }
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct Jwk {
    pub kid: Option<String>,
    pub kty: Option<String>,
    pub n: Option<String>,
    pub e: Option<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct JwksSet {
    pub keys: Vec<Jwk>,
}

impl JwksSet {
    pub fn from_json(raw: &str) -> Result<Self, AuthError> {
        serde_json::from_str(raw).map_err(|error| AuthError::Jwks(error.to_string()))
    }

    pub fn decoding_key(&self, kid: Option<&str>) -> Result<DecodingKey, AuthError> {
        let jwk = self
            .keys
            .iter()
            .find(|key| match kid {
                Some(id) => key.kid.as_deref() == Some(id),
                None => true,
            })
            .ok_or_else(|| AuthError::Jwks("kid introuvable".into()))?;
        DecodingKey::from_rsa_components(
            jwk.n.as_deref().unwrap_or(""),
            jwk.e.as_deref().unwrap_or("AQAB"),
        )
        .map_err(|error| AuthError::Jwks(error.to_string()))
    }
}

#[derive(Default)]
struct JwksCache {
    entry: Mutex<Option<CacheEntry>>,
}

struct CacheEntry {
    fetched_at: Instant,
    json: String,
}

#[derive(Clone)]
pub struct Keycloak {
    issuer: String,
    audience: String,
    jwks_uri: String,
    optional: bool,
    cache: Arc<JwksCache>,
}

impl Keycloak {
    pub fn from_parts(issuer: &str, audience: &str, jwks_uri: &str, optional: bool) -> Self {
        Self {
            issuer: issuer.trim_end_matches('/').to_string(),
            audience: audience.to_string(),
            jwks_uri: jwks_uri.to_string(),
            optional,
            cache: Arc::new(JwksCache::default()),
        }
    }

    pub fn from_env() -> Self {
        let issuer = std::env::var("KEYCLOAK_ISSUER")
            .unwrap_or_default()
            .trim_end_matches('/')
            .to_string();
        let jwks_uri = std::env::var("KEYCLOAK_JWKS_URI").unwrap_or_else(|_| {
            if issuer.is_empty() {
                String::new()
            } else {
                format!("{issuer}/protocol/openid-connect/certs")
            }
        });
        Self::from_parts(
            &issuer,
            &std::env::var("KEYCLOAK_AUDIENCE").unwrap_or_else(|_| "qinode-graphql".into()),
            &jwks_uri,
            std::env::var("KEYCLOAK_OPTIONAL").ok().as_deref() == Some("true"),
        )
    }

    pub fn required(&self) -> bool {
        !self.optional && !self.issuer.is_empty()
    }

    pub fn ready(&self) -> Result<(), AuthError> {
        if self.optional {
            return Ok(());
        }
        if self.issuer.is_empty() {
            return Err(AuthError::Configuration(
                "KEYCLOAK_ISSUER requis lorsque KEYCLOAK_OPTIONAL n'est pas true".into(),
            ));
        }
        if self.jwks_uri.is_empty() {
            return Err(AuthError::Configuration("KEYCLOAK_JWKS_URI vide".into()));
        }
        Ok(())
    }

    fn cache_ttl(&self) -> Duration {
        let millis = std::env::var("KEYCLOAK_JWKS_CACHE_MS")
            .ok()
            .and_then(|value| value.parse::<u64>().ok())
            .unwrap_or(600_000);
        Duration::from_millis(millis)
    }

    async fn fetch_jwks(&self) -> Result<JwksSet, AuthError> {
        let raw = reqwest::Client::new()
            .get(&self.jwks_uri)
            .send()
            .await
            .map_err(|error| AuthError::Jwks(error.to_string()))?
            .text()
            .await
            .map_err(|error| AuthError::Jwks(error.to_string()))?;
        let set = JwksSet::from_json(&raw)?;
        *self.cache.entry.lock().expect("verrou cache jwks") = Some(CacheEntry {
            fetched_at: Instant::now(),
            json: raw,
        });
        Ok(set)
    }

    async fn jwks_set(&self, force_refresh: bool) -> Result<JwksSet, AuthError> {
        if !force_refresh {
            let guard = self.cache.entry.lock().expect("verrou cache jwks");
            if let Some(entry) = guard.as_ref() {
                if entry.fetched_at.elapsed() < self.cache_ttl() {
                    return JwksSet::from_json(&entry.json);
                }
            }
        }
        self.fetch_jwks().await
    }

    /// Vérification hors réseau (signature + iss + aud) — utilisée par
    /// [`Keycloak::authenticate`] et par les tests négatifs.
    pub fn verify_with_jwks(&self, raw: &str, jwks: &JwksSet) -> Result<Value, AuthError> {
        let kid = decode_header(raw)
            .map_err(|error| AuthError::Jwt(error.to_string()))?
            .kid;
        let key = jwks.decoding_key(kid.as_deref())?;
        let mut validation = Validation::new(Algorithm::RS256);
        validation.set_issuer(&[&self.issuer]);
        validation.validate_aud = false;
        let data = decode::<Value>(raw, &key, &validation)
            .map_err(|error| AuthError::Jwt(error.to_string()))?;
        if !self.audience_ok(&data.claims) {
            return Err(AuthError::Audience(self.audience.clone()));
        }
        Ok(data.claims)
    }

    /// Authentifie le porteur et renvoie un [`Principal`] exploitable.
    pub async fn authenticate(&self, header: Option<&str>) -> Result<Principal, AuthError> {
        if !self.required() {
            return Ok(Principal::anonymous());
        }
        let raw = header
            .and_then(|value| value.strip_prefix("Bearer "))
            .ok_or(AuthError::Missing)?;
        let jwks = self.jwks_set(false).await?;
        let claims = match self.verify_with_jwks(raw, &jwks) {
            Ok(claims) => claims,
            Err(AuthError::Jwks(_)) => {
                // Rotation de clé possible : rafraîchissement forcé, une seule nouvelle tentative.
                let refreshed = self.jwks_set(true).await?;
                self.verify_with_jwks(raw, &refreshed)?
            }
            Err(other) => return Err(other),
        };
        Ok(self.principal_from_claims(&claims))
    }

    /// Compat : vérifie le jeton et renvoie les claims bruts.
    pub async fn verify_bearer(&self, header: Option<&str>) -> Result<Value, AuthError> {
        if !self.required() {
            return Ok(serde_json::json!({"anonymous": true}));
        }
        let raw = header
            .and_then(|value| value.strip_prefix("Bearer "))
            .ok_or(AuthError::Missing)?;
        let jwks = self.jwks_set(false).await?;
        match self.verify_with_jwks(raw, &jwks) {
            Ok(claims) => Ok(claims),
            Err(AuthError::Jwks(_)) => {
                let refreshed = self.jwks_set(true).await?;
                self.verify_with_jwks(raw, &refreshed)
            }
            Err(other) => Err(other),
        }
    }

    pub fn principal_from_claims(&self, claims: &Value) -> Principal {
        let mut tenants = BTreeSet::new();
        if let Some(listed) = claims["tenants"].as_array() {
            for tenant in listed {
                if let Some(name) = tenant.as_str() {
                    tenants.insert(name.to_string());
                }
            }
        }
        let groups: Vec<&str> = claims["groups"]
            .as_array()
            .map(|values| values.iter().filter_map(|value| value.as_str()).collect())
            .unwrap_or_default();
        for tenant in tenants_from_groups(&groups) {
            tenants.insert(tenant);
        }
        Principal {
            subject: claims["sub"].as_str().unwrap_or("inconnu").to_string(),
            tenants: tenants.into_iter().collect(),
            roles: roles_from_claims(claims),
            anonymous: claims["anonymous"].as_bool() == Some(true),
        }
    }

    fn audience_ok(&self, claims: &Value) -> bool {
        let want = &self.audience;
        match &claims["aud"] {
            Value::String(s) if s == want => true,
            Value::Array(list) if list.iter().any(|item| item.as_str() == Some(want.as_str())) => {
                true
            }
            _ => {
                let azp = claims["azp"].as_str().unwrap_or("");
                std::env::var("KEYCLOAK_REQUIRE_AUD").ok().as_deref() == Some("false")
                    && azp == "qinode-web"
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn required_auth_rejects_missing_issuer() {
        let keycloak = Keycloak::from_parts("", "qinode-graphql", "", false);
        assert!(matches!(keycloak.ready(), Err(AuthError::Configuration(_))));
    }

    #[test]
    fn explicitly_optional_auth_is_ready_for_local_development() {
        let keycloak = Keycloak::from_parts("", "qinode-graphql", "", true);
        assert!(keycloak.ready().is_ok());
    }

    #[test]
    fn tenant_groups_are_normalized_and_deduplicated() {
        let groups = [
            "/tenants/acme/operators",
            "/tenant/beta",
            "/tenants/acme/auditors",
        ];
        assert_eq!(tenants_from_groups(&groups), vec!["acme", "beta"]);
    }

    #[test]
    fn tenant_scope_is_fail_closed() {
        let admin = Principal {
            subject: "a".into(),
            tenants: Vec::new(),
            roles: vec!["qinode-admin".into()],
            anonymous: false,
        };
        let tenant_user = Principal {
            subject: "u".into(),
            tenants: vec!["acme".into()],
            roles: vec!["qinode-operator".into()],
            anonymous: false,
        };
        let bare_user = Principal {
            subject: "b".into(),
            tenants: Vec::new(),
            roles: vec!["qinode-operator".into()],
            anonymous: false,
        };
        assert!(admin.tenant_allowed("beta"));
        assert!(tenant_user.tenant_allowed("acme"));
        assert!(!tenant_user.tenant_allowed("beta"));
        // Fail-closed : sans tenants listés, aucun tenant n'est accessible.
        assert!(!bare_user.tenant_allowed("acme"));
        assert!(ensure_tenant_allowed(&tenant_user, "beta").is_err());
    }
}
