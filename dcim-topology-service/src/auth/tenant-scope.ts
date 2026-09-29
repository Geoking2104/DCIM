import { KeycloakUser } from './keycloak-user';

/** Périmètre de sites : 'all' (admin / dev local) ou liste de sites autorisés. */
export type SiteScope = 'all' | string[];

type TenantEntry = {
  slug?: string;
  tenant?: string;
  siteId?: string;
};

/**
 * Catalogue tenant → site (`TENANT_CATALOG`, JSON `[{"slug":"paris-east","siteId":"site-paris-01"}, …]`).
 * Sans entrée — ou sans catalogue — l'identité est utilisée : le slug du tenant
 * vaut alors l'identifiant de site. Même convention que le gateway Rust
 * (`qinode-auth::TenantCatalog`).
 */
export function tenantSiteMap(raw: string | undefined = process.env.TENANT_CATALOG): Map<string, string> {
  const map = new Map<string, string>();
  if (!raw) return map;
  try {
    const parsed = JSON.parse(raw) as TenantEntry[];
    if (!Array.isArray(parsed)) return map;
    for (const entry of parsed) {
      const slug = String(entry?.slug ?? entry?.tenant ?? '').trim();
      if (!slug) continue;
      const siteId = String(entry?.siteId ?? '').trim();
      map.set(slug, siteId || slug);
    }
  } catch {
    // Catalogue illisible : identité uniquement.
  }
  return map;
}

/**
 * Périmètre d'un appelant (miroir des règles du gateway Rust) :
 *
 * - `'all'` : principal administrateur, ou développement local explicite
 *   (`KEYCLOAK_OPTIONAL=true` sans utilisateur) ;
 * - sinon : sites des tenants listés dans le jeton. Le header `x-tenant` —
 *   déjà validé par `GqlAuthGuard` contre les tenants de l'utilisateur —
 *   restreint le périmètre à ce seul tenant ;
 * - fail-closed : sans tenant listé, le périmètre est vide.
 */
export function allowedSites(
  user: KeycloakUser | undefined,
  tenantHeader?: string,
  map: Map<string, string> = tenantSiteMap(),
): SiteScope {
  if (!user) {
    return process.env.KEYCLOAK_OPTIONAL === 'true' ? 'all' : [];
  }
  if (user.roles.includes('qinode-admin')) return 'all';
  const tenants = tenantHeader ? [tenantHeader] : user.tenants;
  const sites = new Set<string>();
  for (const tenant of tenants) {
    const value = String(tenant ?? '').trim();
    if (value) sites.add(map.get(value) ?? value);
  }
  return [...sites];
}

/** Vrai si le site est dans le périmètre (site vide ou inconnu ⇒ refusé hors `'all'`). */
export function siteAllowed(scope: SiteScope, siteId: string | undefined | null): boolean {
  if (scope === 'all') return true;
  if (!siteId) return false;
  return scope.includes(siteId);
}
