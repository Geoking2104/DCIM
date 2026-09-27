import assert from 'node:assert/strict';
import test from 'node:test';

import { calcCue, calcErf, calcPue, calcWue } from '../lib/energyCalcs.ts';

test('energy ratios calculate their documented values', () => {
  assert.deepEqual(calcPue(130, 100), { ok: true, value: 1.3 });
  assert.deepEqual(calcWue(25_000, 100_000), { ok: true, value: 0.25 });
  assert.deepEqual(calcCue(40, 100), { ok: true, value: 0.4 });
  assert.deepEqual(calcErf(20, 100), { ok: true, value: 0.2 });
});

test('energy ratios reject invalid denominators and impossible PUE input', () => {
  assert.equal(calcPue(100, 0).ok, false);
  assert.equal(calcPue(90, 100).ok, false);
  assert.equal(calcWue(1, 0).ok, false);
  assert.equal(calcCue(1, 0).ok, false);
  assert.equal(calcErf(1, 0).ok, false);
  assert.equal(calcErf(-1, 100).ok, false);
});
