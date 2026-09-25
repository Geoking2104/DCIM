# JWKS Keycloak

## URL
Realm `qinode` :

```
{KEYCLOAK_ISSUER}/protocol/openid-connect/certs
```

Exemple : `https://auth.example/realms/qinode/protocol/openid-connect/certs`

Le document OpenID : `{issuer}/.well-known/openid-configuration` → champ `jwks_uri`.

## Env Nest
```
KEYCLOAK_ISSUER=https://auth.example/realms/qinode
KEYCLOAK_JWKS_URI=https://auth.example/realms/qinode/protocol/openid-connect/certs
KEYCLOAK_AUDIENCE=qinode-graphql
KEYCLOAK_JWKS_CACHE_MS=600000
KEYCLOAK_JWKS_COOLDOWN_MS=30000
KEYCLOAK_CLOCK_TOLERANCE=5
```

`KEYCLOAK_JWKS_URI` prime sur l’URL déduite de l’issuer (utile derrière un ingress interne).

## Realm
- Keys → Active RSA (RS256) pour les access tokens
- Client `qinode-web` : Access Token Signature Algorithm = RS256 (pas HS256)
- Rotation de clés : laisser l’ancienne `passive` le temps du cache JWKS (10 min)

## Vérif
```
curl -s $KEYCLOAK_JWKS_URI | jq '.keys[] | {kid,kty,use,alg}'
```
Le `kid` du JWT header doit matcher une clé `use=sig`.
