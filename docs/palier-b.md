# Palier B — ClickHouse

Même table que le front : `dcim.power_metrics`
(`grid_power_kw`, `ups_power_kw`, `pdu_power_kw`, `rack_power_kw`, `battery_cell_temp`, `voltage`).

```bash
export CLICKHOUSE_URL=http://127.0.0.1:8123
cargo run -p qinode-gateway
curl -s -X POST localhost:8088/v1/telemetry/power \
  -H 'content-type: application/json' \
  -d '{"rack_id":"RACK-05","grid_kw":1300,"ups_kw":1240,"pdu_kw":1210,"rack_kw":180,"cell_temp":32,"voltage":415}'
```

`/fr/power` continue à lire via `/api/clickhouse/power`.
