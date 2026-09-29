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
| Autorisation **par resolver** (Rust & Nest) | ABAC par requête/mutation : périmètre de sites par tenant (`TENANT_CATALOG`), écriture `qinode-ops`, suppression `qinode-admin`, subscriptions filtrées | **En place** | `qinode-graph` (tests `auth_tests`), `resolver-scope.test.cjs`, `tenant-scope.test.cjs` |
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

## Autorisation par resolver (périmètre sites)

Chaque requête et mutation GraphQL (Rust `qinode-graph` et Nest
`topology.resolver`) vérifie un périmètre dérivé du porteur :

- **Traduction tenant → site** via le catalogue `TENANT_CATALOG`
  (JSON `[{"slug":"paris-east","siteId":"site-paris-01"}, …]`), partagé par
  `qinode-auth::TenantCatalog` et `auth/tenant-scope.ts` ; identité par défaut
  si le slug est absent du catalogue.
- **Lecture** : les racks (et leurs devices) hors périmètre sont filtrés de la
  liste ; un rack unitaire hors périmètre est refusé.
- **Écriture** : rôle `qinode-ops` (ou admin) **et** cible dans le périmètre ;
  suppression de rack : `qinode-admin`. Un déplacement de device d'un tenant
  vers un autre est refusé (source et cible contrôlées).
- **Subscriptions** : les événements sont filtrés par périmètre (racks par
  site, devices par rack autorisé au moment de l'abonnement).
- **Développement local** : `KEYCLOAK_OPTIONAL=true` → principal anonyme =
  accès complet explicite (comportement historique) ; sinon fail-closed.
- Sans `Principal` en contexte GraphQL : accès refusé.

Tests négatifs inter-tenants : `crates/qinode-graph` (module `auth_tests`) et
`dcim-topology-service/test/resolver-scope.test.cjs` (+ `tenant-scope.test.cjs`
pour le header `x-tenant`).

## Reste à faire (suite P1)

1. ~~Autorisation par resolver~~ **Fait** : périmètre par resolver côté Rust et
   Nest (voir « Autorisation par resolver » ci-dessus), avec tests négatifs
   inter-tenants.
2. Jeton de service pour les collecteurs (`/v1/telemetry/*`) : client
   credentials Keycloak + scopes dédiés.
3. Cloisonnement des caches, journaux et réponses d'API par tenant.
4. Filtrage tenant dans la récupération IA avant activation du copilote.
