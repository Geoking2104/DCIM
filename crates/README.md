# Palier A — sidecar Rust

```bash
cd crates
cargo test -p qinode-core
cargo run -p qinode-gateway
# autre terminal
curl -s localhost:8088/health
curl -s -X POST localhost:8088/v1/metrics/pue \
  -H 'content-type: application/json' \
  -d '{"facility_kwh":130,"it_kwh":100}'
```

Docker : `docker compose up --build qinode-gateway`

Le front Next appelle `/api/metrics/pue|wue` qui parle au sidecar (`RUST_GATEWAY_URL`). Si le sidecar est éteint, le même calcul tourne en TypeScript.
