# Keycloak sur le gateway Rust

Même variables que Nest :

```
KEYCLOAK_ISSUER=https://idp.example/realms/qinode
KEYCLOAK_JWKS_URI=   # défaut {issuer}/protocol/openid-connect/certs
KEYCLOAK_AUDIENCE=qinode-graphql
KEYCLOAK_OPTIONAL=true   # désactive la vérif (dev)
KEYCLOAK_REQUIRE_AUD=false  # accepte azp=qinode-web
KEYCLOAK_JWKS_CACHE_MS=600000  # TTL du cache JWKS
```

`POST /graphql` vérifie `Authorization: Bearer` et injecte un `Principal`
(sujet, tenants, rôles) dans le contexte GraphQL.
`/graphql/ws` vérifie `connectionParams.authorization` à l'ouverture et injecte
le même `Principal`.
Les écritures `POST /v1/telemetry/power` et `POST /v1/redfish/snapshot` exigent
un jeton dès que Keycloak est requis (`KEYCLOAK_OPTIONAL` différent de `true`).
Sans `KEYCLOAK_ISSUER`, auth off (principal anonyme, développement local).

Périmètre tenant : fail-closed via `Principal::tenant_allowed` — hors
`qinode-admin`, l'utilisateur doit lister le tenant demandé. Cache JWKS avec
rafraîchissement forcé quand un `kid` inconnu suggère une rotation de clé.

Tests : `cargo test -p qinode-auth` (jetons de test signés localement, cas
négatifs : expiration, émetteur, audience, signature, kid, tenant étranger).
