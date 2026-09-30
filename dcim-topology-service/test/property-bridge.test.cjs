const assert = require('node:assert/strict');
const test = require('node:test');

const { readNumber, readString } = require('../dist/topology/property-bridge');

test('prefers camelCase and falls back to snake_case', () => {
  assert.equal(readNumber({ heightU: 42 }, 'heightU', 'height_u'), 42);
  assert.equal(readNumber({ height_u: 40 }, 'heightU', 'height_u'), 40);
  assert.equal(readNumber({ heightU: 42, height_u: 1 }, 'heightU', 'height_u'), 42);
});

test('converts Neo4j integers and legacy floats, never returns NaN', () => {
  assert.equal(readNumber({ heightU: { toNumber: () => 42 } }, 'heightU', 'height_u'), 42);
  assert.equal(readNumber({ height_u: 41.9 }, 'heightU', 'height_u'), 41.9);
  assert.equal(readNumber({}, 'heightU', 'height_u', 7), 7);
  assert.equal(readNumber({ heightU: null }, 'heightU', 'height_u', 7), 7);
  assert.equal(readNumber({ heightU: 'abc' }, 'heightU', 'height_u', 7), 7);
});

test('readString bridges both conventions with fallback', () => {
  assert.equal(readString({ siteId: 'PAR-1' }, 'siteId', 'site_id'), 'PAR-1');
  assert.equal(readString({ site_id: 'PAR-2' }, 'siteId', 'site_id'), 'PAR-2');
  assert.equal(readString({}, 'siteId', 'site_id'), '');
  assert.equal(readString({ siteId: null }, 'siteId', 'site_id', 'n/a'), 'n/a');
});
