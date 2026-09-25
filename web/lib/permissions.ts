import { ROLES, rolesForPath, hasAnyRole } from '@/lib/roles';

export type TenantPerm = {
  slug: string;
  roles: string[];
};

const TEAM_ROLE: Record<string, string> = {
  admins: ROLES.ADMIN,
  admin: ROLES.ADMIN,
  ops: ROLES.OPERATOR,
  operators: ROLES.OPERATOR,
  exploitation: ROLES.OPERATOR,
  energy: ROLES.ENERGY,
  energie: ROLES.ENERGY,
  power: ROLES.ENERGY,
  compliance: ROLES.COMPLIANCE,
  rse: ROLES.COMPLIANCE,
  eed: ROLES.COMPLIANCE,
  viewers: ROLES.VIEWER,
  viewer: ROLES.VIEWER,
  lecture: ROLES.VIEWER
};

export function permissionsFromGroups(groups: string[], globalRoles: string[] = []): TenantPerm[] {
  const map = new Map<string, Set<string>>();
  const isGlobalAdmin = globalRoles.includes(ROLES.ADMIN);

  for (const g of groups) {
    const parts = g.split('/').filter(Boolean);
    const i = parts.findIndex((p) => p === 'tenants' || p === 'tenant');
    if (i < 0 || !parts[i + 1]) continue;
    const slug = parts[i + 1];
    const team = parts[i + 2];
    if (!map.has(slug)) map.set(slug, new Set());
    if (team && TEAM_ROLE[team]) map.get(slug)!.add(TEAM_ROLE[team]);
    else map.get(slug)!.add(ROLES.VIEWER);
  }

  if (isGlobalAdmin) {
    for (const slug of map.keys()) {
      map.get(slug)!.add(ROLES.ADMIN);
    }
  }

  return Array.from(map.entries()).map(([slug, roles]) => ({
    slug,
    roles: Array.from(roles)
  }));
}

export function canAccessTenant(perms: TenantPerm[], slug: string, globalRoles: string[]) {
  if (globalRoles.includes(ROLES.ADMIN)) return true;
  return perms.some((p) => p.slug === slug && p.roles.length > 0);
}

export function rolesOnTenant(perms: TenantPerm[], slug: string, globalRoles: string[]) {
  if (globalRoles.includes(ROLES.ADMIN)) return [ROLES.ADMIN, ...globalRoles];
  return perms.find((p) => p.slug === slug)?.roles || [];
}

export function canAccessPath(pathname: string, tenantRoles: string[]) {
  const needed = rolesForPath(pathname);
  if (!needed) return true;
  return hasAnyRole(tenantRoles, needed);
}
