const assert = require('node:assert/strict');
const test = require('node:test');

const { allowedSites, siteAllowed, tenantSiteMap } = require('../dist/auth/tenant-scope');

const CATALOG = new Map([
  ['paris-east', 'site-paris-01'],
  ['lille', 'site-lille-01'],
]);

function user(overrides = {}) {
  return {
    sub: 'user-1',
    roles: ['qinode-ops'],
    tenants: ['paris-east'],
    groups: [],
    raw: {},
    ...overrides,
  };
}

test('admin sees every site', () => {
  const scope = allowedSites(user({ roles: ['qinode-admin'] }), undefined, CATALOG);
  assert.equal(scope, 'all');
  assert.equal(siteAllowed(scope, 'site-lille-01'), true);
});

test('ops is scoped to the sites of its tenants', () => {
  const scope = allowedSites(user(), undefined, CATALOG);
  assert.deepEqual(scope, ['site-paris-01']);
  assert.equal(siteAllowed(scope, 'site-paris-01'), true);
  // Négatif inter-tenant : le site de l'autre tenant est refusé.
  assert.equal(siteAllowed(scope, 'site-lille-01'), false);
});

test('the x-tenant header narrows the scope to that tenant only', () => {
  const scope = allowedSites(user({ tenants: ['paris-east', 'lille'] }), 'lille', CATALOG);
  assert.deepEqual(scope, ['site-lille-01']);
  assert.equal(siteAllowed(scope, 'site-paris-01'), false);
});

test('identity fallback when the catalog has no entry', () => {
  const scope = allowedSites(user({ tenants: ['site-direct'] }), undefined, CATALOG);
  assert.deepEqual(scope, ['site-direct']);
});

test('users without tenants are fail-closed', () => {
  const scope = allowedSites(user({ tenants: [] }), undefined, CATALOG);
  assert.deepEqual(scope, []);
  assert.equal(siteAllowed(scope, 'site-paris-01'), false);
  assert.equal(siteAllowed(scope, null), false);
  assert.equal(siteAllowed(scope, undefined), false);
});

test('local development without keycloak is explicit (KEYCLOAK_OPTIONAL)', () => {
  const previous = process.env.KEYCLOAK_OPTIONAL;
  try {
    delete process.env.KEYCLOAK_OPTIONAL;
    assert.deepEqual(allowedSites(undefined, undefined, CATALOG), []);
    process.env.KEYCLOAK_OPTIONAL = 'true';
    assert.equal(allowedSites(undefined, undefined, CATALOG), 'all');
  } finally {
    if (previous === undefined) delete process.env.KEYCLOAK_OPTIONAL;
    else process.env.KEYCLOAK_OPTIONAL = previous;
  }
});

test('catalog parsing tolerates invalid input and empty entries', () => {
  assert.equal(tenantSiteMap('not json').size, 0);
  assert.equal(tenantSiteMap('').size, 0);
  assert.equal(tenantSiteMap('{"slug":"x"}').size, 0);
  const map = tenantSiteMap('[{"slug":"a","siteId":"site-a"},{"tenant":"b"},{"slug":""}]');
  assert.equal(map.get('a'), 'site-a');
  assert.equal(map.get('b'), 'b');
  assert.equal(map.size, 2);
});
