# Événements de cycle de vie

## Socket graphql-ws
`connecting` → `connected` → `closed` / `error`  
Badge LiveRacks via `web/lib/wsLifecycle.ts`.

## Topologie (`subscription { topologyLifecycle }`)

| kind | Quand |
|---|---|
| RACK_CREATED / UPDATED / DELETED | mutations rack |
| DEVICE_MOUNTED / UPDATED / MOVED / UNMOUNTED | mutations device |

Payload : `kind`, `at`, `rackId`, `deviceId`, `rack`, `device`.
Toujours publié aussi sur `rackUpdated` / `deviceMounted` (compat).
