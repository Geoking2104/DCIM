# Supervision Qinode

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml --profile monitor up -d
```

| Service | URL |
| --- | --- |
| Grafana | http://localhost:3001 (admin / `GRAFANA_PASSWORD` défaut `qinode`) |
| Prometheus | http://localhost:9090 |
| PUE produit | `/fr/metriques` · `GET /api/metrics/live` |

Datasources provisionnés : ClickHouse (`timeseries-db:8123`, base `dcim`) et Prometheus.
Dashboard : **Qinode · Puissance & PUE** (folder Qinode).

Grafana est local. Pas de Grafana Cloud.
