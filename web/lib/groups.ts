import { ROLES } from '@/lib/roles';

export const GROUP_ROLE_MAP: Record<string, string> = {
  '/qinode/admins': ROLES.ADMIN,
  '/qinode/admin': ROLES.ADMIN,
  '/qinode/ops': ROLES.OPERATOR,
  '/qinode/operators': ROLES.OPERATOR,
  '/qinode/energy': ROLES.ENERGY,
  '/qinode/compliance': ROLES.COMPLIANCE,
  '/qinode/rse': ROLES.COMPLIANCE,
  '/qinode/viewers': ROLES.VIEWER,
  '/qinode/viewer': ROLES.VIEWER,
  qinode_admins: ROLES.ADMIN,
  qinode_ops: ROLES.OPERATOR,
  qinode_energy: ROLES.ENERGY,
  qinode_compliance: ROLES.COMPLIANCE,
  qinode_viewers: ROLES.VIEWER
};

export function normalizeGroup(g: string) {
  return g.trim();
}

export function rolesFromGroups(groups: string[]) {
  const roles = new Set<string>();
  for (const raw of groups) {
    const g = normalizeGroup(raw);
    if (GROUP_ROLE_MAP[g]) roles.add(GROUP_ROLE_MAP[g]);
    const leaf = g.split('/').filter(Boolean).pop() || '';
    if (GROUP_ROLE_MAP[leaf]) roles.add(GROUP_ROLE_MAP[leaf]);
    if (GROUP_ROLE_MAP[`/qinode/${leaf}`]) roles.add(GROUP_ROLE_MAP[`/qinode/${leaf}`]);
  }
  return Array.from(roles);
}

export function tenantsFromGroups(groups: string[]) {
  const tenants: string[] = [];
  for (const raw of groups) {
    const parts = normalizeGroup(raw).split('/').filter(Boolean);
    const i = parts.findIndex((p) => p === 'tenants' || p === 'tenant');
    if (i >= 0 && parts[i + 1]) tenants.push(parts[i + 1]);
  }
  return Array.from(new Set(tenants));
}

export function extractKeycloakGroups(accessToken: string): string[] {
  try {
    const payload = accessToken.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const claim = json.groups || json['group-membership'] || json.realm_access?.groups || [];
    return Array.isArray(claim) ? claim.map(String) : [];
  } catch {
    return [];
  }
}
