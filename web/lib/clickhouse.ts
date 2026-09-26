export interface PowerPoint {
  timestamp: string;
  grid_kw: number;
  ups_kw: number;
  pdu_kw: number;
  rack_kw: number;
  cell_temp: number;
  voltage: number;
}

const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://localhost:8123';
const CLICKHOUSE_DB = process.env.CLICKHOUSE_DB || 'dcim';

export const HISTORY_HOURS = [1, 24, 168, 720] as const;
export type HistoryHours = (typeof HISTORY_HOURS)[number];

export function clampHours(raw?: string | number | null): HistoryHours {
  const n = Number(raw);
  return (HISTORY_HOURS as readonly number[]).includes(n) ? (n as HistoryHours) : 1;
}

function bucketExpr(hours: HistoryHours) {
  if (hours <= 1) return 'toStartOfMinute(timestamp)';
  if (hours <= 24) return 'toStartOfFiveMinutes(timestamp)';
  if (hours <= 168) return 'toStartOfHour(timestamp)';
  return 'toStartOfInterval(timestamp, INTERVAL 6 HOUR)';
}

function mockSeries(hours: HistoryHours): PowerPoint[] {
  const stepMin = hours <= 1 ? 1 : hours <= 24 ? 5 : hours <= 168 ? 60 : 360;
  const n = Math.min(720, Math.floor((hours * 60) / stepMin));
  const now = Date.now();
  return Array.from({ length: n }, (_, i) => {
    const t = new Date(now - (n - 1 - i) * stepMin * 60000);
    const day = Math.sin((i / n) * Math.PI * 2);
    const baseLoad = 1240 + day * 90 + Math.sin(i / 10) * 40;
    return {
      timestamp: t.toISOString(),
      grid_kw: baseLoad * 1.05,
      ups_kw: baseLoad,
      pdu_kw: baseLoad * 0.98,
      rack_kw: (baseLoad * 0.85) / 6,
      cell_temp: 32 + Math.sin(i / 5) * 2,
      voltage: 415 + (Math.random() - 0.5) * 5
    };
  });
}

export async function queryClickHouse(query: string): Promise<any[]> {
  if (!process.env.CLICKHOUSE_URL) return [];
  try {
    const res = await fetch(CLICKHOUSE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: query + ' FORMAT JSON'
    });
    const json = await res.json();
    return json.data || [];
  } catch (e) {
    console.error('ClickHouse query failed', e);
    return [];
  }
}

export async function getPowerTimeseries(rackId?: string, hours: HistoryHours = 1): Promise<PowerPoint[]> {
  if (!process.env.CLICKHOUSE_URL) return mockSeries(hours);
  const safeRack = rackId ? rackId.replace(/'/g, '') : '';
  const q = `
    SELECT
      ${bucketExpr(hours)} as timestamp,
      avg(grid_power_kw) as grid_kw,
      avg(ups_power_kw) as ups_kw,
      avg(pdu_power_kw) as pdu_kw,
      avg(rack_power_kw) as rack_kw,
      avg(battery_cell_temp) as cell_temp,
      avg(voltage) as voltage
    FROM ${CLICKHOUSE_DB}.power_metrics
    WHERE timestamp >= now() - INTERVAL ${hours} HOUR
    ${safeRack ? `AND rack_id='${safeRack}'` : ''}
    GROUP BY timestamp
    ORDER BY timestamp ASC
  `;
  const data = await queryClickHouse(q);
  return data.length ? (data as PowerPoint[]) : mockSeries(hours);
}

export async function getBatteryCells(rackId: string = 'RACK-05') {
  if (!process.env.CLICKHOUSE_URL) {
    return Array.from({ length: 12 }, (_, i) => ({
      cell_id: `CELL-${String(i + 1).padStart(2, '0')}`,
      rack_id: rackId,
      voltage: 3.65 + (Math.random() - 0.5) * 0.1,
      temp: 30 + Math.random() * 8 + (i === 5 ? 12 : 0),
      soc: 92 - i * 0.5 + Math.random() * 2,
      status: i === 5 ? 'warning' : 'ok',
      last_update: new Date().toISOString()
    }));
  }
  const safe = rackId.replace(/'/g, '');
  const q = `SELECT cell_id, voltage, temp, soc, status FROM ${CLICKHOUSE_DB}.battery_cells WHERE rack_id='${safe}' ORDER BY cell_id`;
  return await queryClickHouse(q);
}
