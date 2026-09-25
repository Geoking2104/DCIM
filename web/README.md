# DCIM Web — Qinode.eu Next.js UI

Bilingual (FR/EN) Next.js 14 operations and product UI for the DCIM platform.

It covers:

- Marketing / platform overview (`/[locale]`)
- Power-chain supervision (`/[locale]/power`) — Grid → UPS → PDU → rack → battery cell
- Live rack table via GraphQL (`NEXT_PUBLIC_GRAPHQL_URL`)
- ClickHouse proxies under `/api/clickhouse/{power,battery}`

## Stack

- Next.js 14 App Router + TypeScript
- next-intl (`fr` default, `en`)
- Tailwind (Salesforce Lightning-inspired tokens)
- Apollo Client + graphql-ws
- Recharts for power timeseries

## Local run

From the repository root, start the data plane:

```bash
docker compose up -d
```

Then start the UI:

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 (redirects to `/fr`).

Power page: http://localhost:3000/fr/power

If ClickHouse or GraphQL are not reachable, the UI falls back to mock telemetry so the screens still render.

## Environment

| Variable | Default | Role |
|---|---|---|
| `NEXT_PUBLIC_GRAPHQL_URL` | `http://localhost:4000/graphql` | Topology service |
| `CLICKHOUSE_URL` | `http://localhost:8123` | Time-series HTTP |
| `CLICKHOUSE_DB` | `dcim` | Database name |
