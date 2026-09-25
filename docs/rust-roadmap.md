# Qinode — Rust d’abord, bascule progressive

Le front Next.js (`web/`) reste. Le cœur métier bascule vers Rust. Nest (`dcim-topology-service`) reste le GraphQL racks **jusqu’au palier C**.

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

### A — Sidecar (maintenant)
- `crates/qinode-gateway` :8088
- `POST /v1/metrics/pue` `POST /v1/metrics/wue`
- Nest inchangé. Front peut pointer `NEXT_PUBLIC_RUST_URL`
- Critère : `curl :8088/health` + tests `cargo test`

### B — Télémétrie
- Writer ClickHouse Rust (chaîne compteur → prise)
- Même schéma que `web/app/api/clickhouse`
- Critère : `/fr/power` lit les deux écrivains sans casser

### C — Topologie
- `async-graphql` + Neo4j (`neo4rs`)
- JWKS Keycloak déjà documenté (`aud=qinode-graphql`)
- Proxy Next `/api/graphql` bascule d’URL
- Nest en lecture seule 30 jours puis arrêt

### D — Bord salle
- Collecteur Rust (Modbus / Redfish), pas de Node en salle
- Air-gap : binaire unique, pas de runtime JS

### E — Copilote local
- Inference on-prem (llama.cpp / bindings), hors Vercel

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
