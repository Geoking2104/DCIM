export type KeycloakUser = {
  sub: string;
  email?: string;
  preferred_username?: string;
  roles: string[];
  groups: string[];
  tenants: string[];
  raw: Record<string, unknown>;
};

export function tenantsFromGroups(groups: string[]): string[] {
  const out = new Set<string>();
  for (const g of groups) {
    const parts = g.split('/').filter(Boolean);
    const i = parts.findIndex((p) => p === 'tenants' || p === 'tenant');
    if (i >= 0 && parts[i + 1]) out.add(parts[i + 1]);
  }
  return [...out];
}

export function rolesFromPayload(payload: Record<string, unknown>): string[] {
  const realm = (payload.realm_access as { roles?: string[] } | undefined)?.roles || [];
  const clientId = process.env.KEYCLOAK_CLIENT_ID || 'qinode-web';
  const resource = payload.resource_access as Record<string, { roles?: string[] }> | undefined;
  const client = resource?.[clientId]?.roles || resource?.['qinode-graphql']?.roles || [];
  return [...new Set([...realm, ...client].map(String).filter((r) => r.startsWith('qinode-')))];
}
