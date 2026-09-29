import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildIeeeCsv,
  detectCellAnomalies,
  NOMINAL_VOLTAGE,
  worstAnomaly
} from '../lib/powerShield.ts';

test('li-ion detection flags voltage drop, temperature and low SoC', () => {
  const cells = [
    { cell_id: 'CELL-01', voltage: 3.66, temp: 28, soc: 95, status: 'ok' },
    { cell_id: 'CELL-02', voltage: 3.35, temp: 30, soc: 90, status: 'ok' },
    { cell_id: 'CELL-03', voltage: 3.2, temp: 44, soc: 40, status: 'warning' },
    { cell_id: 'CELL-04', voltage: 3.65, temp: 30, soc: 10, status: 'ok' }
  ];
  const anomalies = detectCellAnomalies(cells, 'li-ion');
  assert.equal(anomalies.length, 3);
  assert.equal(worstAnomaly(anomalies)?.cellId, 'CELL-03');
  assert.equal(worstAnomaly(anomalies)?.severity, 'critical');
  assert.ok(anomalies.find((a) => a.cellId === 'CELL-02' && a.severity === 'warning'));
  assert.match(anomalies.find((a) => a.cellId === 'CELL-04')?.reason ?? '', /SoC/);
});

test('healthy VRLA string produces no anomaly at float voltage', () => {
  const cells = [
    { cell_id: 'CELL-01', voltage: 2.25, temp: 26, soc: 98, status: 'ok' },
    { cell_id: 'CELL-02', voltage: 2.21, temp: 27, soc: 96, status: 'ok' }
  ];
  assert.deepEqual(detectCellAnomalies(cells, 'vrla'), []);
  assert.equal(NOMINAL_VOLTAGE.vrla, 2.25);
});

test('CSV export quotes fields and flags the anomalous cell', () => {
  const cells = [
    { cell_id: 'CELL-01', voltage: 3.66, temp: 26, soc: 98, status: 'ok', last_update: '2026-09-29T08:00:00Z' },
    { cell_id: 'CELL-02', voltage: 3.1, temp: 42, soc: 35, status: 'warning', last_update: '2026-09-29T08:00:00Z' }
  ];
  const anomalies = detectCellAnomalies(cells, 'li-ion');
  const csv = buildIeeeCsv('UPS-A1', 'li-ion', cells, anomalies, '2026-09-29T08:00:00Z');
  const lines = csv.split('\n');
  assert.ok(lines[0].startsWith('# Qinode PowerShield'));
  assert.equal(lines[3], 'chain,cell_id,voltage_v,temp_c,soc_pct,status,dyad_flag,measured_at');
  assert.match(lines[4], /"UPS-A1","CELL-01"/);
  assert.match(lines[4], /"ok"/);
  assert.match(lines[5], /"critical: /);
});
