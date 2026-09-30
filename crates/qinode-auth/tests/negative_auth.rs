//! Tests négatifs du durcissement Keycloak : signature, expiration, émetteur,
//! audience, kid inconnu, isolation tenant (fail-closed).
//!
//! Les clés RSA de `tests/fixtures/` sont des clés de test locales, sans usage
//! de production : elles servent uniquement à forger des jetons pour ces tests.

use jsonwebtoken::{encode, Algorithm, EncodingKey, Header};
use qinode_auth::{ensure_tenant_allowed, AuthError, JwksSet, Keycloak};
use serde_json::{json, Value};
use std::time::{SystemTime, UNIX_EPOCH};

const JWKS: &str = include_str!("fixtures/test_jwks.json");
const KEY: &str = include_str!("fixtures/test_key.pem");
const KID: &str = "test-key-1";
const ISSUER: &str = "https://idp.test/realms/qinode";
const AUDIENCE: &str = "qinode-graphql";

fn keycloak() -> Keycloak {
    Keycloak::from_parts(ISSUER, AUDIENCE, "https://idp.test/certs", false)
}

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("horloge système")
        .as_secs() as i64
}

fn token_with_kid(claims: &Value, kid: &str) -> String {
    let mut header = Header::new(Algorithm::RS256);
    header.kid = Some(kid.to_string());
    let key = EncodingKey::from_rsa_pem(KEY.as_bytes()).expect("clé de test");
    encode(&header, claims, &key).expect("jeton de test")
}

fn token(claims: &Value) -> String {
    token_with_kid(claims, KID)
}

fn base_claims(exp_offset_seconds: i64) -> Value {
    let exp = now() + exp_offset_seconds;
    json!({
        "sub": "user-1",
        "iss": ISSUER,
        "aud": AUDIENCE,
        "iat": exp - 60,
        "exp": exp,
        "tenants": ["acme"],
        "realm_access": { "roles": ["qinode-operator", "offline_access"] },
        "groups": ["/tenants/acme/operators"]
    })
}

fn jwks() -> JwksSet {
    JwksSet::from_json(JWKS).expect("jwks de test")
}

#[test]
fn valid_token_authenticates_and_extracts_principal() {
    let kc = keycloak();
    let raw = token(&base_claims(3600));
    let claims = kc.verify_with_jwks(&raw, &jwks()).expect("jeton valide");
    let principal = kc.principal_from_claims(&claims);
    assert_eq!(principal.subject, "user-1");
    assert_eq!(principal.tenants, vec!["acme"]);
    assert_eq!(principal.roles, vec!["qinode-operator"]);
    assert!(!principal.anonymous);
}

#[test]
fn expired_token_is_rejected() {
    let kc = keycloak();
    let raw = token(&base_claims(-120));
    let error = kc.verify_with_jwks(&raw, &jwks()).expect_err("expiré");
    assert!(matches!(error, AuthError::Jwt(_)));
}

#[test]
fn wrong_issuer_is_rejected() {
    let kc = keycloak();
    let mut claims = base_claims(3600);
    claims["iss"] = json!("https://autre-idp.test/realms/qinode");
    let error = kc
        .verify_with_jwks(&token(&claims), &jwks())
        .expect_err("émetteur refusé");
    assert!(matches!(error, AuthError::Jwt(_)));
}

#[test]
fn wrong_audience_is_rejected() {
    let kc = keycloak();
    let mut claims = base_claims(3600);
    claims["aud"] = json!("un-autre-service");
    let error = kc
        .verify_with_jwks(&token(&claims), &jwks())
        .expect_err("audience refusée");
    assert!(matches!(error, AuthError::Audience(_)));
}

#[test]
fn tampered_signature_is_rejected() {
    let kc = keycloak();
    let raw = token(&base_claims(3600));
    let mut parts: Vec<String> = raw.split('.').map(str::to_string).collect();
    let signature = parts.last_mut().expect("signature");
    let replacement = if signature.ends_with('A') { 'B' } else { 'A' };
    signature.pop();
    signature.push(replacement);
    let tampered = parts.join(".");
    let error = kc
        .verify_with_jwks(&tampered, &jwks())
        .expect_err("signature altérée");
    assert!(matches!(error, AuthError::Jwt(_)));
}

#[test]
fn unknown_kid_is_rejected() {
    let kc = keycloak();
    let raw = token_with_kid(&base_claims(3600), "rotation-inconnue");
    let error = kc.verify_with_jwks(&raw, &jwks()).expect_err("kid inconnu");
    assert!(matches!(error, AuthError::Jwks(_)));
}

#[test]
fn cross_tenant_access_is_denied() {
    let kc = keycloak();
    let principal = kc.principal_from_claims(&base_claims(3600));
    assert!(ensure_tenant_allowed(&principal, "acme").is_ok());
    let error = ensure_tenant_allowed(&principal, "beta").expect_err("tenant étranger");
    assert!(matches!(error, AuthError::Tenant(tenant) if tenant == "beta"));
}

#[test]
fn tenant_claim_and_group_are_merged() {
    let kc = keycloak();
    let mut claims = base_claims(3600);
    claims["groups"] = json!(["/tenants/acme/operators", "/tenants/gamma/viewers"]);
    let principal = kc.principal_from_claims(&claims);
    assert_eq!(principal.tenants, vec!["acme", "gamma"]);
}
