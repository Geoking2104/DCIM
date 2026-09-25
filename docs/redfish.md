# Redfish — libredfish

Crate : [libredfish 0.2](https://crates.io/crates/libredfish) (client BMC NVIDIA / standard).

## Flux

```
BMC HTTPS :443  →  RedfishClientPool.create_client(Endpoint)
                 →  get_power_state / get_systems / get_power_metrics / get_thermal_metrics
                 →  POST /v1/redfish/snapshot
```

Lecture seule. Pas d’appel `power()`, `bmc_reset()`, `lockdown()`.

## Appel

```bash
curl -s -X POST localhost:8088/v1/redfish/snapshot \
  -H 'content-type: application/json' \
  -d '{"host":"10.0.0.21","user":"operator","password":"…"}'
```

Identifiants BMC : réseau salle uniquement. Ne pas exposer cet endpoint sur Vercel.

## Suite palier B
Mapper `Power` / `Thermal` vers lignes ClickHouse (watts, inlet) au lieu du `Debug` string.
