# Métriques Qinode

Barre commune : `components/metrics/MetricsLinks.tsx`

| Page | Route |
| --- | --- |
| Vue d’ensemble | `/[locale]/metriques` |
| PUE période | `/[locale]/outils/pue` |
| WUE | `/[locale]/outils/wue` |
| CUE | `/[locale]/outils/cue` |
| ERF | `/[locale]/outils/erf` |
| Puissance live | `/[locale]/power` |
| Dossier EED | `/[locale]/eed` → `/[locale]/modules/conformite-eed` |

## APIs

- `POST /api/metrics/pue` `{ facility_kwh, it_kwh }` — Rust sidecar puis fallback `energyCalcs`
- `POST /api/metrics/wue` `{ water_liters, it_kwh }`
- `POST /api/metrics/cue` `{ co2_kg, it_kwh }`
- `POST /api/metrics/erf` `{ reused_kwh, facility_kwh }`
- `GET /api/clickhouse/power?rack=` — série 60 min, base de `LivePue` (`grid_kw / rack_kw`)

## Rack partagé

`localStorage qinode.lastRack` via `lib/lastRack.ts`. `LivePue` sans prop lit cette clé, sinon `RACK-05`.

Le PUE ClickHouse n’est pas un PUE ISO de période.
