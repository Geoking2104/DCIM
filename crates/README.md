# Palier A — sidecar Rust

```bash
cd crates
cargo test -p qinode-core
NEO4J_URI=bolt://localhost:7687 \
NEO4J_USER=neo4j \
NEO4J_PASSWORD=change-me \
  cargo run -p qinode-gateway
# autre terminal
curl -s localhost:8088/health
curl -s localhost:8088/health/live
curl -s localhost:8088/health/ready
curl -s -X POST localhost:8088/v1/metrics/pue \
  -H 'content-type: application/json' \
  -d '{"facility_kwh":130,"it_kwh":100}'
```

Docker : `docker compose up --build graph-db qinode-gateway`

Le gateway crée les contraintes d'unicité `Rack.id` et `Device.id` au démarrage et refuse de démarrer si Neo4j est absent ou mal configuré. Le front Next appelle `/api/metrics/pue|wue` via `RUST_GATEWAY_URL`; le calcul TypeScript local n'est utilisé qu'en mode démonstration explicite.

`/health/live` vérifie uniquement que le processus répond. `/health/ready` vérifie ClickHouse, Neo4j et la configuration Keycloak, et renvoie `503` tant que le gateway ne peut pas recevoir de trafic. Le Compose local active explicitement `KEYCLOAK_OPTIONAL=true`; cette option doit rester désactivée en production.
