# Audience JWT Keycloak

## Valeur

`aud` **doit** contenir `qinode-graphql`.

Nest : `KEYCLOAK_AUDIENCE=qinode-graphql` (défaut).

`azp=qinode-web` seul **ne suffit plus**, sauf `KEYCLOAK_REQUIRE_AUD=false`.

## Mapper Keycloak (client qinode-web)

1. Clients → `qinode-web` → Client scopes → `qinode-web-dedicated`
2. Add mapper → **Audience**
   - Name : `aud-graphql`
   - Included Client Audience : `qinode-graphql`
   - Add to access token : ON
   - Add to ID token : OFF
3. Créer le client `qinode-graphql` (bearer-only) s’il n’existe pas — le mapper a besoin de cet ID client.

Option realm : *Audience Resolve* sur le scope `profile` si plusieurs API.

## Vérif token

```
jq -R 'split(".")[1]|@base64d|fromjson|{aud,azp,iss}' <<< "$ACCESS_TOKEN"
```

Attendu :
```json
{ "iss": "https://…/realms/qinode", "aud": ["qinode-graphql", "account"], "azp": "qinode-web" }
```

## Env
```
KEYCLOAK_AUDIENCE=qinode-graphql
KEYCLOAK_REQUIRE_AUD=true
KEYCLOAK_ACCEPT_AZP=qinode-web
```
