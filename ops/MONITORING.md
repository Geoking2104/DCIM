# Supervision Qinode — palier 1

Collecte : Telegraf (Redfish + SNMP lecture seule).
Stockage : ClickHouse existant (`timeseries-db`).
Alerte : plus tard (Prometheus overlay).
Graphe : Neo4j, pas Telegraf.

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml up -d telegraf
```

Variables (ne pas committer les secrets BMC) :

- `REDFISH_HOST` `REDFISH_USER` `REDFISH_PASSWORD`
- `SNMP_AGENT` (IP PDU / ToR) `SNMP_COMMUNITY`

Telegraf écrit dans `dcim.power_metrics` via HTTP 8123.
`GET /api/metrics/live` lit le dernier point.
