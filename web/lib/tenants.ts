export type Tenant = {
  slug: string;
  name: string;
  siteId?: string;
};

const FALLBACK: Tenant[] = [
  { slug: 'paris-east', name: 'Paris East High-Density', siteId: 'site-paris-01' },
  { slug: 'lille', name: 'Lille DC', siteId: 'site-lille-01' }
];

export function catalog(): Tenant[] {
  const raw = process.env.TENANT_CATALOG;
  if (!raw) return FALLBACK;
  try {
    const parsed = JSON.parse(raw) as Tenant[];
    return Array.isArray(parsed) && parsed.length ? parsed : FALLBACK;
  } catch {
    return FALLBACK;
  }
}

export function tenantFromGroupPath(group: string): string | null {
  const parts = group.split('/').filter(Boolean);
  const i = parts.findIndex((p) => p === 'tenants' || p === 'tenant');
  if (i >= 0 && parts[i + 1]) return parts[i + 1];
  return null;
}

export function resolveTenants(slugs: string[]): Tenant[] {
  const cat = catalog();
  const out: Tenant[] = [];
  for (const slug of slugs) {
    const known = cat.find((t) => t.slug === slug);
    out.push(known || { slug, name: slug.replace(/-/g, ' ') });
  }
  if (!out.length) return cat;
  return out;
}

export const TENANT_COOKIE = 'qinode_tenant';
