# BMS Qinode

Lecture UI : `/fr/supervision/bms` · `GET /api/bms/points`

| Variable | Rôle |
| --- | --- |
| `BMS_URL` | Endpoint passerelle (ex. `http://bms-gw:47808`) |
| `BMS_PROTO` | `bacnet` ou `modbus` |
| `BMS_WRITE` | `1` pour autoriser `POST /api/bms/write` à sortir du 403 |

Sans `BMS_URL` la page sert des points démo.  
`POST /api/bms/write` reste bloqué : le connecteur terrain n’envoie aucune trame.

Actions prédictives planifiées → `pendingWrites` mappées :
- `precool` → `AHU-1.SP`
- `crah-night` → `AHU-2.RUN`

Collecte lecture (même overlay Telegraf que le monitoring) : voir commentaires dans `ops/telegraf.conf`.
