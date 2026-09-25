# Keycloak → GraphQL

Le navigateur n’envoie **jamais** le access token. Apollo appelle `/api/graphql` (same-origin). Le proxy relit le cookie httpOnly `kc_access` et ajoute `Authorization: Bearer …` + `X-Tenant` vers le topology service.

## Clients Keycloak

### qinode-web (existant)
- Standard flow + PKCE
- Redirect : `https://dcim-web.vercel.app/api/auth/keycloak/callback`
- Audience mapper : ajouter `qinode-graphql` dans `aud`

### qinode-graphql (nouveau, bearer-only / confidential)
- Client authentication : on
- Standard flow : off
- Direct access : off
- Bearer only : on
- Service accounts : off

## Mapper access token (client qinode-web)
1. Dedicated scopes → Add mapper → Audience
   - Included Client Audience : `qinode-graphql`
2. Realm roles + Group Membership (claim `groups`, full path) déjà requis

## Topology service
Vérifier le JWT :
- `iss` = `KEYCLOAK_ISSUER`
- `aud` contient `qinode-graphql`
- roles `realm_access.roles` / groupes `groups`
- header `X-Tenant` doit appartenir aux tenants du token

Env Vercel :
```
KEYCLOAK_ISSUER=https://<host>/realms/qinode
KEYCLOAK_CLIENT_ID=qinode-web
GRAPHQL_INTERNAL_URL=https://topology.internal/graphql
```
