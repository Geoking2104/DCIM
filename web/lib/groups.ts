import { loadGroupMappings, matchMapping } from '@/lib/group-mappings';

export function extractKeycloakGroups(accessToken: string): string[] {
  try {
    const payload = accessToken.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const claim = json.groups || json['group-membership'] || [];
    return Array.isArray(claim) ? claim.map(String) : [];
  } catch {
    return [];
  }
}

export function rolesFromGroups(groups: string[]) {
  const roles = new Set<string>();
  const mappings = loadGroupMappings();
  for (const g of groups) {
    matchMapping(g, mappings).forEach((m) => {
      if (m.role) roles.add(m.role);
    });
  }
  return Array.from(roles);
}

export function tenantsFromGroups(groups: string[]) {
  const tenants = new Set<string>();
  const mappings = loadGroupMappings();
  for (const g of groups) {
    matchMapping(g, mappings).forEach((m) => {
      if (m.tenant) tenants.add(m.tenant);
    });
    const parts = g.split('/').filter(Boolean);
    const i = parts.findIndex((p) => p === 'tenants' || p === 'tenant');
    if (i >= 0 && parts[i + 1]) tenants.add(parts[i + 1]);
  }
  return Array.from(tenants);
}
