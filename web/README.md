# DCIM Web — Qinode.eu Next.js UI

Bilingual (FR/EN) Next.js 14 product and operations UI for Qinode DCIM.

## Surfaces

| Surface | Route |
| --- | --- |
| Marketing home | `/[locale]` |
| Plateforme | `/[locale]/plateforme` |
| Métriques PUE · WUE · CUE · ERF | `/[locale]/metriques` |
| Calculatrices | `/[locale]/outils/pue` `wue` `cue` `erf` |
| Découverte réseau | `/[locale]/outils/decouverte` |
| Puissance live | `/[locale]/power` |
| EED / label A–G (preview) | `/[locale]/eed` |
| Supervision + inbox Grafana | `/[locale]/supervision` |
| Graphe / racks / journal | `/[locale]/graphe-reseau` `topologie` `journal-brassage` |

Carte détaillée : [METRICS.md](METRICS.md).

## APIs Next

- `POST /api/metrics/{pue,wue,cue,erf}` — calcul période (sidecar Rust puis fallback JS)
- `GET /api/metrics/live?rack=` — PUE instantané ClickHouse (`grid_kw / rack_kw`, `official: false`)
- `GET /api/clickhouse/{power,battery}` — séries 60 min
- `GET|POST /api/alerts` — webhook Grafana → mémoire ou table `dcim.alerts`

Le rack affiché par `LivePue` suit `localStorage qinode.lastRack` (`lib/lastRack.ts`).

## Stack

- Next.js 14 App Router + TypeScript
- next-intl (`fr` default, `en`)
- Tailwind (Salesforce Lightning-inspired tokens)
- Apollo Client + graphql-ws
- Recharts for power timeseries

## Local run

From the repository root:

```bash
docker compose up -d
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/fr`).

Optional ops overlay (Grafana :3001, Prometheus :9090, Telegraf):

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml --profile monitor up -d
```

See [../ops/MONITORING.md](../ops/MONITORING.md).

If ClickHouse or GraphQL are not reachable, the UI falls back to mock telemetry.

## Environment

| Variable | Default | Role |
|---|---|---|
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql` | Topology service |
| `CLICKHOUSE_URL` | `http://localhost:8123` | Time-series HTTP + persist alerts |
| `CLICKHOUSE_DB` | `dcim` | Database name |
