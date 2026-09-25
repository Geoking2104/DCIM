import { ROLES } from '@/lib/roles';

export type GroupMapping = {
  group: string;
  role?: string;
  tenant?: string;
};

export const DEFAULT_GROUP_MAPPINGS: GroupMapping[] = [
  { group: '/qinode/admins', role: ROLES.ADMIN },
  { group: '/qinode/admin', role: ROLES.ADMIN },
  { group: '/qinode/ops', role: ROLES.OPERATOR },
  { group: '/qinode/operators', role: ROLES.OPERATOR },
  { group: '/qinode/exploitation', role: ROLES.OPERATOR },
  { group: '/qinode/energy', role: ROLES.ENERGY },
  { group: '/qinode/energie', role: ROLES.ENERGY },
  { group: '/qinode/power', role: ROLES.ENERGY },
  { group: '/qinode/compliance', role: ROLES.COMPLIANCE },
  { group: '/qinode/rse', role: ROLES.COMPLIANCE },
  { group: '/qinode/eed', role: ROLES.COMPLIANCE },
  { group: '/qinode/viewers', role: ROLES.VIEWER },
  { group: '/qinode/viewer', role: ROLES.VIEWER },
  { group: '/qinode/lecture', role: ROLES.VIEWER },
  { group: '/tenants/paris-east', tenant: 'paris-east' },
  { group: '/tenants/lille', tenant: 'lille' }
];

export function loadGroupMappings(): GroupMapping[] {
  const raw = process.env.KEYCLOAK_GROUP_ROLE_MAP;
  if (!raw) return DEFAULT_GROUP_MAPPINGS;
  try {
    const parsed = JSON.parse(raw) as GroupMapping[];
    if (!Array.isArray(parsed)) return DEFAULT_GROUP_MAPPINGS;
    return [...DEFAULT_GROUP_MAPPINGS, ...parsed];
  } catch {
    return DEFAULT_GROUP_MAPPINGS;
  }
}

export function matchMapping(group: string, mappings = loadGroupMappings()) {
  const exact = mappings.filter((m) => m.group === group);
  if (exact.length) return exact;
  const leaf = group.split('/').filter(Boolean).pop();
  return mappings.filter((m) => {
    const mLeaf = m.group.split('/').filter(Boolean).pop();
    return leaf && mLeaf === leaf;
  });
}
