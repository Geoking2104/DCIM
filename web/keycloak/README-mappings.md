# Mappages groupes Keycloak → Qinode

## Mapper Keycloak requis
Client scopes → profile (ou dedicated) → Add mapper → Group Membership
- Claim name: `groups`
- Full group path: ON
- Add to access token: ON
- Add to userinfo: ON

## Groupes → rôles (défaut)
| Groupe | Rôle |
|---|---|
| /qinode/admins | qinode-admin |
| /qinode/ops | qinode-operator |
| /qinode/energy | qinode-energy |
| /qinode/compliance | qinode-compliance |
| /qinode/viewers | qinode-viewer |
| /tenants/<slug> | tenant=<slug> |

## Surcharge Vercel
Variable `KEYCLOAK_GROUP_ROLE_MAP` (JSON array fusionnée au défaut) :

```json
[
  { "group": "/qinode/direction", "role": "qinode-admin" },
  { "group": "/tenants/marseille", "tenant": "marseille" }
]
```

Inspection : GET `/api/auth/mappings`
