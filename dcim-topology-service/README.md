# DCIM Topology Service

NestJS + GraphQL + Neo4j. Auth : JWT Keycloak (JWKS).

## Env
```
KEYCLOAK_ISSUER=https://<host>/realms/qinode
KEYCLOAK_AUDIENCE=qinode-graphql
KEYCLOAK_CLIENT_ID=qinode-web
KEYCLOAK_OPTIONAL=true   # désactive le guard en local
CORS_ORIGINS=https://dcim-web.vercel.app,http://localhost:3000
```

Le guard lit `Authorization: Bearer`, vérifie `iss` + JWKS, accepte `aud=qinode-graphql` ou `azp=qinode-web`, remplit `ctx.user` (roles `qinode-*`, groups, tenants) et refuse un `X-Tenant` hors périmètre (sauf `qinode-admin`).
