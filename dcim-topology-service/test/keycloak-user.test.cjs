const assert = require('node:assert/strict');
const test = require('node:test');

const { rolesFromPayload, tenantsFromGroups } = require('../dist/auth/keycloak-user');

test('tenant groups are normalized and deduplicated', () => {
  assert.deepEqual(
    tenantsFromGroups(['/tenants/acme/operators', '/tenant/beta', '/tenants/acme/auditors']),
    ['acme', 'beta'],
  );
});

test('only Qinode roles are retained across realm and client claims', () => {
  const previousClientId = process.env.KEYCLOAK_CLIENT_ID;
  process.env.KEYCLOAK_CLIENT_ID = 'qinode-web';

  try {
    assert.deepEqual(
      rolesFromPayload({
        realm_access: { roles: ['offline_access', 'qinode-operator'] },
        resource_access: {
          'qinode-web': { roles: ['qinode-operator', 'qinode-auditor', 'account-user'] },
        },
      }),
      ['qinode-operator', 'qinode-auditor'],
    );
  } finally {
    if (previousClientId === undefined) delete process.env.KEYCLOAK_CLIENT_ID;
    else process.env.KEYCLOAK_CLIENT_ID = previousClientId;
  }
});
