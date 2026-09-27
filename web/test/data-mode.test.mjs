import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DataSourceUnavailableError,
  dataSourceUnavailable,
  normalizeDataSourceError,
  serverDemoModeEnabled
} from '../lib/dataMode.ts';

test('demo mode requires an explicit true value', () => {
  const previous = process.env.DCIM_DEMO_MODE;
  const previousPublic = process.env.NEXT_PUBLIC_DCIM_DEMO_MODE;
  try {
    delete process.env.DCIM_DEMO_MODE;
    delete process.env.NEXT_PUBLIC_DCIM_DEMO_MODE;
    assert.equal(serverDemoModeEnabled(), false);
    process.env.DCIM_DEMO_MODE = 'false';
    process.env.NEXT_PUBLIC_DCIM_DEMO_MODE = 'true';
    assert.equal(serverDemoModeEnabled(), false);
    process.env.DCIM_DEMO_MODE = 'true';
    assert.equal(serverDemoModeEnabled(), true);
    process.env.NEXT_PUBLIC_DCIM_DEMO_MODE = 'false';
    assert.equal(serverDemoModeEnabled(), false);
  } finally {
    if (previous === undefined) delete process.env.DCIM_DEMO_MODE;
    else process.env.DCIM_DEMO_MODE = previous;
    if (previousPublic === undefined) delete process.env.NEXT_PUBLIC_DCIM_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DCIM_DEMO_MODE = previousPublic;
  }
});

test('source failures retain a stable code and source', () => {
  assert.throws(
    () => dataSourceUnavailable('clickhouse', 'missing endpoint'),
    (error) =>
      error instanceof DataSourceUnavailableError &&
      error.code === 'DATA_SOURCE_UNAVAILABLE' &&
      error.source === 'clickhouse'
  );

  const normalized = normalizeDataSourceError('rust', new Error('connection refused'));
  assert.equal(normalized.source, 'rust');
  assert.match(normalized.message, /connection refused/);
});
