const assert = require('node:assert/strict');
const test = require('node:test');

const { tenantAllowed } = require('../dist/auth/keycloak-user');

function user(overrides = {}) {
  return {
    sub: 'user-1',
    roles: ['qinode-operator'],
    groups: [],
    tenants: ['acme'],
    raw: {},
    ...overrides,
  };
}

test('cross-tenant access is denied, own tenant is allowed', () => {
  const acme = user();
  assert.equal(tenantAllowed(acme, 'acme'), true);
  assert.equal(tenantAllowed(acme, 'beta'), false);
});

test('admin bypasses tenant scoping', () => {
  const admin = user({ tenants: [], roles: ['qinode-admin'] });
  assert.equal(tenantAllowed(admin, 'beta'), true);
});

test('users without tenant claims are denied (fail-closed)', () => {
  const bare = user({ tenants: [] });
  assert.equal(tenantAllowed(bare, 'acme'), false);
});

test('missing user is denied', () => {
  assert.equal(tenantAllowed(undefined, 'acme'), false);
});

test('empty tenant header is not scoping material', () => {
  // Un header vide ne doit jamais devenir un tenant implicitement autorisé.
  const acme = user();
  assert.equal(tenantAllowed(acme, ''), false);
});
