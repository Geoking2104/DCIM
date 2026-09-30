# Keycloak · jeton de service pour les collecteurs

Les points d'entrée machine du gateway Rust (`POST /v1/telemetry/power`,
`POST /v1/redfish/snapshot`) exigent un jeton portant le rôle
**`qinode-collector`** (ou `qinode-admin`) dès que Keycloak est requis
(`KEYCLOAK_OPTIONAL` différent de `true`). En développement local, aucun jeton
n'est demandé (principal anonyme).

## Client `qinode-collector` (client credentials)

1. Créer un client confidentiel `qinode-collector` :
   - Service accounts : **on** ; Standard flow / Direct access : off.
2. Rôle client `qinode-collector` (ou rôle realm du même nom), assigné au
   service account.
3. Mapper d'audience : ajouter `qinode-graphql` dans `aud`
   (Client scopes → Dedicated → Add mapper → Audience).
4. Côté gateway : `KEYCLOAK_COLLECTOR_CLIENT=qinode-collector` (valeur par
   défaut) — le client est alors repris dans les rôles du `Principal`.

## Exemple

```bash
TOKEN=$(curl -s -X POST "$KEYCLOAK_ISSUER/protocol/openid-connect/token" \
  -d grant_type=client_credentials \
  -d client_id=qinode-collector -d client_secret="$COLLECTOR_SECRET" \
  | jq -r .access_token)

curl -s -X POST localhost:8088/v1/telemetry/power \
  -H "authorization: Bearer $TOKEN" -H 'content-type: application/json' \
  -d '{"rack_id":"RACK-05","grid_kw":1200,"ups_kw":1180,"pdu_kw":300,"rack_kw":50,"cell_temp":31,"voltage":415}'
```

Sans rôle autorisé : HTTP 403 (`role requise: qinode-collector`). Un jeton
utilisateur classique (viewer, energy…) est également refusé sur ces routes :
elles sont réservées aux collecteurs et aux administrateurs.
