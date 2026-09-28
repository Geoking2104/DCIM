# Palier C — GraphQL Rust + bascule Next

## Bascule

```
GRAPHQL_UPSTREAM=nest   # défaut, Neo4j + Keycloak
GRAPHQL_UPSTREAM=rust   # gateway Rust :8088/graphql, stockage Neo4j
```

Le proxy `web/app/api/graphql` utilise uniquement la cible configurée en mode live et expose la cible dans `x-graphql-upstream`. Il ne bascule plus silencieusement vers un autre service.

## Rust

```bash
NEO4J_URI=bolt://localhost:7687 \
NEO4J_USER=neo4j \
NEO4J_PASSWORD=*** \
  cargo run -p qinode-gateway
curl -s localhost:8088/graphql -H 'content-type: application/json' \
  -d '{"query":"mutation { createRack(input:{name:\"RACK-05\",heightU:42,siteId:\"paris\"}){id name}}"}'
```

Mêmes noms de champs camelCase que Nest. Les racks, devices et relations `MOUNTED_IN` sont persistés dans Neo4j. Le gateway vérifie la connexion et crée les contraintes d'unicité au démarrage.

## Authentification (durcissement en cours)

- `POST /graphql` et `/graphql/ws` vérifient le porteur et injectent un `Principal` dans le contexte.
- Les écritures `POST /v1/telemetry/power` et `POST /v1/redfish/snapshot` exigent un jeton quand Keycloak est requis.
- Périmètre tenant fail-closed (`qinode-auth`), cache JWKS avec rotation — voir `docs/authorization-matrix.md` et `docs/rust-keycloak.md`.

## Suite

1. Autorisation RBAC/ABAC **par resolver** (Rust et Nest) en s'appuyant sur le `Principal` injecté ; tests négatifs bout-en-bout.
2. Subscriptions multi-pod via un bus durable
3. Période de lecture parallèle Nest/Rust avant retrait de Nest
