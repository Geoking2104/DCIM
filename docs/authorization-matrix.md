# Matrice d'autorisation (P1)

État des frontières d'authentification et d'isolation tenant, avec le test qui
couvre chacune. Règle commune : **fail-closed** — hors `KEYCLOAK_OPTIONAL=true`
(développement local), une frontière sans jeton ou hors périmètre est refusée.

| Frontière | Vérification | Statut | Test / preuve |
| --- | --- | --- | --- |
| HTTP GraphQL (`POST /graphql`, gateway Rust) | Bearer vérifié (JWKS, iss, aud) ; `Principal` injecté dans le contexte | **En place** | `qinode-auth/tests/negative_auth.rs` |
| WebSocket (`/graphql/ws`, gateway Rust) | Vérifié à `connection_init` ; `Principal` injecté | **En place** | `negative_auth.rs` + handler |
| Écritures télémétrie (`POST /v1/telemetry/power`) | Bearer requis dès que Keycloak est requis | **En place** | handler `authenticate` |
| Lecture BMC (`POST /v1/redfish/snapshot`) | Bearer requis dès que Keycloak est requis | **En place** | handler `authenticate` |
| Calculs métriques (`POST /v1/metrics/{pue,wue}`) | Non protégé (entrées sans donnée de site) | À décider | — |
| GraphQL Nest (lecture/mutations topologie) | `GqlAuthGuard` + `RolesGuard` + contrôle `x-tenant` | **En place (durci)** | `tenant-scope.test.cjs` |
| Autorisation **par resolver** (Rust & Nest) | ABAC par requête/mutation | **À faire** | palier C, suite |
| Exports et fichiers | Périmètre tenant sur les exports | **À faire** | — |
| Caches et journaux | Cloisonnement par tenant | **À faire** | — |
| Récupération IA / RAG | Filtrage par autorisation tenant | **À faire** | — |

## Durcissements apportés (cette étape)

- Extraction d'un `Principal` (sujet, tenants, rôles `qinode-*`) côté Rust,
  partagé par HTTP et WS ; rôles lus depuis `realm_access` et `resource_access`.
- Périmètre tenant **fail-closed** : un utilisateur qui ne liste aucun tenant
  n'accède à aucun tenant (l'ancien comportement laissait passer un utilisateur
  sans claim). Un administrateur `qinode-admin` conserve l'accès transverse.
- Cache JWKS avec rafraîchissement forcé à la rotation de clé (`kid` inconnu).
- Les écritures télémétrie/BMC du gateway exigent un jeton quand Keycloak est
  requis — les collecteurs d'exploitation devront présenter un jeton de service.

## Reste à faire (suite P1)

1. Autorisation par resolver : vérifier `Principal`/`ctx.tenant` dans chaque
   requête et mutation (Rust et Nest), avec tests négatifs bout-en-bout.
2. Jeton de service pour les collecteurs (`/v1/telemetry/*`) : client
   credentials Keycloak + scopes dédiés.
3. Cloisonnement des caches, journaux et réponses d'API par tenant.
4. Filtrage tenant dans la récupération IA avant activation du copilote.
