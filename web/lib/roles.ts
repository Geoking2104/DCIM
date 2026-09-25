export const ROLES = {
  ADMIN: 'qinode-admin',
  OPERATOR: 'qinode-operator',
  ENERGY: 'qinode-energy',
  COMPLIANCE: 'qinode-compliance',
  VIEWER: 'qinode-viewer'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: 'Administrateur',
  [ROLES.OPERATOR]: 'Exploitation',
  [ROLES.ENERGY]: 'Énergie / puissance',
  [ROLES.COMPLIANCE]: 'Conformité EED',
  [ROLES.VIEWER]: 'Lecture seule'
};

export function rolesForPath(pathname: string): string[] | null {
  if (/\/(eed|modules\/conformite-eed)(\/|$)/.test(pathname)) {
    return [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.OPERATOR];
  }
  if (/\/power(\/|$)/.test(pathname)) {
    return [ROLES.ADMIN, ROLES.ENERGY, ROLES.OPERATOR];
  }
  if (/\/(plateforme|modules)(\/|$)/.test(pathname)) {
    return [ROLES.ADMIN, ROLES.OPERATOR, ROLES.ENERGY, ROLES.COMPLIANCE, ROLES.VIEWER];
  }
  return null;
}

export function hasAnyRole(userRoles: string[], needed: string[]) {
  if (userRoles.includes(ROLES.ADMIN)) return true;
  return needed.some((r) => userRoles.includes(r));
}

export function extractKeycloakRoles(accessToken: string): string[] {
  try {
    const payload = accessToken.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const realm = json.realm_access?.roles || [];
    const clientId = process.env.KEYCLOAK_CLIENT_ID || 'qinode-web';
    const client = json.resource_access?.[clientId]?.roles || [];
    const all = [...realm, ...client].map(String);
    return Array.from(new Set(all.filter((r) => r.startsWith('qinode-'))));
  } catch {
    return [];
  }
}
