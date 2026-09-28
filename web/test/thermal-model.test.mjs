import assert from 'node:assert/strict';
import test from 'node:test';

import {
  balanceRackLoads,
  createInitialRacks,
  maxExhaustTemperature,
  updateRackLoad,
} from '../lib/thermalModel.ts';

test('thermal model derives rack power and exhaust temperature from load', () => {
  const racks = createInitialRacks();
  const stressed = updateRackLoad(racks, 'B-04', 100);
  const target = stressed.find((rack) => rack.id === 'B-04');

  assert.equal(stressed.length, 18);
  assert.equal(target?.loadPct, 100);
  assert.equal(target?.powerKw, 12);
  assert.ok((target?.exhaustTemp ?? 0) > 35);
  assert.equal(maxExhaustTemperature(stressed), target?.exhaustTemp);
});

test('AI balancing narrows the workload spread without changing the rack set', () => {
  const racks = updateRackLoad(createInitialRacks(), 'A-01', 100);
  const balanced = balanceRackLoads(racks);
  const loads = balanced.map((rack) => rack.loadPct);

  assert.deepEqual(
    balanced.map((rack) => rack.id),
    racks.map((rack) => rack.id),
  );
  assert.ok(Math.max(...loads) - Math.min(...loads) <= 4);
});
