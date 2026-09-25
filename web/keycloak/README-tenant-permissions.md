# Permissions par tenant

Chemin Keycloak : `/tenants/<slug>/<equipe>`

| Sous-groupe | Permission sur ce tenant seulement |
|---|---|
| `/tenants/paris-east/admins` | admin Paris |
| `/tenants/paris-east/ops` | exploitation Paris |
| `/tenants/paris-east/energy` | énergie Paris |
| `/tenants/paris-east/compliance` | EED Paris |
| `/tenants/paris-east/viewers` | lecture Paris |
| `/tenants/paris-east` | lecture (défaut) |

`/qinode/admins` reste global (tous tenants).

Un user dans `/tenants/lille/energy` peut ouvrir `/power` sur Lille, pas l’EED Lille, et rien sur Paris.
