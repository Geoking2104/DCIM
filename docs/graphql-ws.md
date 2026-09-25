# graphql-ws

| Cible | URL |
|---|---|
| Nest | `ws://localhost:4000/graphql` |
| Rust | `ws://127.0.0.1:8088/graphql/ws` |

`connection_init.payload.authorization` = `Bearer …`  
Le front le récupère via `GET /api/auth/ws-params` (cookie `kc_access` httpOnly, same-origin).

Rust : `GraphQLSubscription.on_connection_init` → même JWKS que `POST /graphql`.  
Si `KEYCLOAK_OPTIONAL=true` ou pas d’issuer, connexion acceptée sans token.
