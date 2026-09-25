# Supervision Qinode

| Palier | Outil | Commande |
| --- | --- | --- |
| 1 Collecte | Telegraf SNMP/Redfish → ClickHouse | `--profile monitor` |
| 2 Alerte | Prometheus scrape ClickHouse :9363 + Telegraf | `--profile monitor` (service prometheus) |
| 3 GPU | DCGM exporter | plus tard |

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml --profile monitor up -d
```

UI Prometheus : http://localhost:9090  
PUE produit : `/fr/metriques` et `GET /api/metrics/live`

Grafana n’est pas lancé : ClickHouse reste l’historique, le site Next.js reste la face Qinode.
