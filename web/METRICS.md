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
| Jumeau 3D thermique HVAC | `/[locale]/jumeau` |
| Console thermique interactive | `/[locale]/topologie/thermique` |
| Moteur WebGL plein écran | `/twin/thermal-hvac.html` |
| Variante flux HVAC | `/twin/thermal-flux.html` |
| Dossier EED | `/[locale]/eed` → `/[locale]/modules/conformite-eed` |

Le thème thermique se décline en deux vues complémentaires : le **jumeau plein écran** (`/jumeau`, moteur laya-onnx) pour la démonstration, et la **console interactive** (`/topologie/thermique`, React/Three.js) pour l'exploration opérationnelle (couches air/eau, charges rack, incidents simulés). Les deux restent marquées « démo » tant qu'elles ne sont pas branchées sur la télémétrie réelle.

## APIs

- `POST /api/metrics/pue` `{ facility_kwh, it_kwh }` — sidecar Rust ; `energyCalcs` seulement si le mode démo est explicitement actif
- `POST /api/metrics/wue` `{ water_liters, it_kwh }`
- `POST /api/metrics/cue` `{ co2_kg, it_kwh }`
- `POST /api/metrics/erf` `{ reused_kwh, facility_kwh }`
- `GET /api/metrics/live?rack=` — PUE instantané `{ ok, value, grid_kw, it_kw, at }`
- `GET /api/clickhouse/power?rack=` — série 60 min

Les routes dépendantes d’une source durable répondent `503 DATA_SOURCE_UNAVAILABLE` plutôt que d’injecter silencieusement des valeurs simulées. En mode démo explicite, l’en-tête `X-DCIM-Data-Source: demo` et le champ `source` signalent les réponses concernées.

## Rack partagé

`localStorage qinode.lastRack` via `lib/lastRack.ts`. `LivePue` sans prop lit cette clé, sinon `RACK-05`.

Le PUE ClickHouse n’est pas un PUE ISO de période.
