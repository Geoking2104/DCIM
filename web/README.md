# DCIM Web — Qinode.eu Next.js UI

Bilingual (FR/EN) Next.js 16 product and operations UI for Qinode DCIM.

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
| Jumeau thermique 3D / flux HVAC | `/[locale]/topologie/thermique` |
| Supervision + inbox Grafana | `/[locale]/supervision` |
| Graphe / racks / journal | `/[locale]/graphe-reseau` `topologie` `journal-brassage` |

Carte détaillée : [METRICS.md](METRICS.md).

## APIs Next

- `POST /api/metrics/{pue,wue}` — calcul période par le sidecar Rust ; calcul local uniquement en mode démo explicite
- `POST /api/metrics/{cue,erf}` — calcul local de prévisualisation, toujours marqué non officiel
- `GET /api/metrics/live?rack=` — PUE instantané ClickHouse (`grid_kw / rack_kw`, `official: false`)
- `GET /api/clickhouse/{power,battery}` — séries 60 min
- `GET|POST /api/alerts` — webhook Grafana → table durable `dcim.alerts` ; mémoire uniquement en mode démo explicite

Le rack affiché par `LivePue` suit `localStorage qinode.lastRack` (`lib/lastRack.ts`).

## Stack

- Next.js 16 App Router + TypeScript
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
npm ci
npm run dev
```

Open http://localhost:3000 (redirects to `/fr`).

Optional ops overlay (Grafana :3001, Prometheus :9090, Telegraf):

```bash
docker compose -f docker-compose.yml -f docker-compose.monitor.yml --profile monitor up -d
```

See [../ops/MONITORING.md](../ops/MONITORING.md).

Le mode normal échoue de façon visible (`503 DATA_SOURCE_UNAVAILABLE`) si ClickHouse, GraphQL, Rust ou le BMS requis est indisponible. Les données simulées ne sont autorisées que lorsque `DCIM_DEMO_MODE=true` et `NEXT_PUBLIC_DCIM_DEMO_MODE=true`. Une bannière persistante identifie alors l’interface comme démonstration.

Pour le site public Vercel de démonstration, configurez ces deux variables à `true` dans les paramètres du projet pour les environnements concernés, puis redéployez. Elles restent à `false` pour toute installation opérationnelle.

## Environment

| Variable | Default | Role |
|---|---|---|
| `DCIM_DEMO_MODE` | `false` | Autorise côté serveur les jeux simulés et les journaux en mémoire |
| `NEXT_PUBLIC_DCIM_DEMO_MODE` | `false` | Affiche explicitement les jeux simulés et la bannière de démonstration |
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql` | Topology service |
| `CLICKHOUSE_URL` | `http://localhost:8123` | Time-series HTTP + persist alerts |
| `CLICKHOUSE_DB` | `dcim` | Database name |
