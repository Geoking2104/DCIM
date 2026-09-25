# Keycloak sur le gateway Rust

Même variables que Nest :

```
KEYCLOAK_ISSUER=https://idp.example/realms/qinode
KEYCLOAK_JWKS_URI=   # défaut {issuer}/protocol/openid-connect/certs
KEYCLOAK_AUDIENCE=qinode-graphql
KEYCLOAK_OPTIONAL=true   # désactive la vérif (dev)
KEYCLOAK_REQUIRE_AUD=false  # accepte azp=qinode-web
```

`POST /graphql` vérifie `Authorization: Bearer`.  
`/graphql/ws` n’est pas encore filtré (connectionParams à brancher).
Sans `KEYCLOAK_ISSUER`, auth off.
