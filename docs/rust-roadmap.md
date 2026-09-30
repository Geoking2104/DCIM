# Qinode - Rust d'abord, bascule progressive

Le front Next.js (`web/`) reste. Le cœur métier bascule vers Rust. Nest (`dcim-topology-service`) reste disponible en parallèle pendant la validation du palier C.

## Cible

```
Capteurs → qinode-ingest (Rust) → ClickHouse + graphe
                ↓
         qinode-gateway (Axum)
                ↓
     web Next + Keycloak
```

| Crate | Rôle |
|---|---|
| `qinode-core` | PUE / WUE / domaines, `official=false` |
| `qinode-gateway` | HTTP `/v1/metrics/*`, plus tard GraphQL |
| `qinode-ingest` (palier B) | Redfish / SNMP → ClickHouse |
| `qinode-graph` (palier C) | remplace Nest topology |
| `qinode-edge` (palier D) | collecteur salle, QUIC |

## Paliers

### A - Sidecar (maintenant)
- `crates/qinode-gateway` :8088
- `POST /v1/metrics/pue` `POST /v1/metrics/wue`
- Nest inchangé. Front peut pointer `NEXT_PUBLIC_RUST_URL`
- Critère : `curl :8088/health` + tests `cargo test`

### B - Télémétrie
- Writer ClickHouse Rust (chaîne compteur → prise)
- Même schéma que `web/app/api/clickhouse`
- Critère : `/fr/power` lit les deux écrivains sans casser

### C - Topologie
- `async-graphql` + Neo4j (`neo4rs`) - persistance rack/device livrée
- JWKS Keycloak déjà documenté (`aud=qinode-graphql`)
- Proxy Next `/api/graphql` bascule d'URL
- Test d'intégration CI : rack et device relus après reconstruction du schéma GraphQL
- Isolation tenant livrée (requêtes, mutations, subscriptions ; ponts d'interopérabilité camelCase/snake_case validés dans les deux sens) ; prochain critère : période de lecture parallèle 30 jours, puis Nest en lecture seule avant arrêt

### D - Bord salle
- Collecteur Rust (Modbus / Redfish), pas de Node en salle
- Air-gap : binaire unique, pas de runtime JS

### E - Copilote local
- Inference on-prem (llama.cpp / bindings), hors Vercel
- Prérequis avant activation : filtrage tenant de la récupération IA (voir `docs/authorization-matrix.md`)

## Déploiement

| Palier | Où | Comment |
|---|---|---|
| A | Docker compose + VM | image `crates/Dockerfile`, port 8088 |
| B | Même compose | ClickHouse déjà là |
| C | K8s / 2 pods | rolling, feature flag `GRAPHQL_UPSTREAM=rust` |
| Front | Vercel | inchangé, proxy vers gateway |
| Secrets | Keycloak + JWKS | déjà prévu |

## Local

```bash
cd crates && cargo test && cargo run -p qinode-gateway
curl -s localhost:8088/health
curl -s -X POST localhost:8088/v1/metrics/pue \
  -H 'content-type: application/json' \
  -d '{"facility_kwh":130,"it_kwh":100}'
```
