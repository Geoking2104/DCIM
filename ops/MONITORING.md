# Supervision Qinode

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml --profile monitor up -d
```

Grafana http://localhost:3001 — Alerting → Contact points `qinode-ops`.

Règles Grafana (dossier Qinode) :
- ClickHouse injoignable — `up{job="clickhouse"} < 1` pendant 2 min
- PUE instantané > 1.4 pendant 5 min (SQL ClickHouse)

Env :
- `GRAFANA_ALERT_EMAIL` (défaut ops@qinode.eu)
- `GRAFANA_ALERT_WEBHOOK`
- `GF_SMTP_HOST` `GF_SMTP_USER` `GF_SMTP_PASSWORD` pour l’e-mail

Sans SMTP, le webhook reste le canal utile.
