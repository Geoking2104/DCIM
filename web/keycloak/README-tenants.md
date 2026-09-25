# Tenants dynamiques

Tout sous-groupe `/tenants/<slug>` dans Keycloak devient un tenant, même s’il n’est pas listé en dur.

Exemples :
- `/tenants/paris-east`
- `/tenants/lille`
- `/tenants/marseille` → tenant `marseille` créé à la volée

Catalogue optionnel (noms / siteId) — env Vercel `TENANT_CATALOG` :

```json
[
  { "slug": "paris-east", "name": "Paris East High-Density", "siteId": "site-paris-01" },
  { "slug": "marseille", "name": "MRS-1", "siteId": "site-mrs-01" }
]
```

APIs :
- GET `/api/tenants` — liste autorisée pour la session
- POST `/api/tenants` `{ "slug" }` — active le tenant (cookie `qinode_tenant`)
