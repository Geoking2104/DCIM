# graphql-ws

Protocole [graphql-transport-ws](https://github.com/enisdenjo/graphql-ws).

| Cible | URL |
|---|---|
| Nest (prod) | `ws://localhost:4000/graphql` |
| Rust sidecar | `ws://127.0.0.1:8088/graphql/ws` |

Le front (Apollo `GraphQLWsLink`) n’ouvre le socket **que** pour les `subscription`. Queries / mutations restent en POST `/api/graphql` (Vercel ne tient pas un WS).

```
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:4000/graphql
```

Subscriptions : `rackUpdated(rackId)` · `deviceMounted(rackId)`.
LiveRacks refetch à chaque `rackUpdated`.
