export interface PowerPoint { timestamp: string; grid_kw: number; ups_kw: number; pdu_kw: number; rack_kw: number; cell_temp: number; voltage: number; }
const CLICKHOUSE_URL = process.env.CLICKHOUSE_URL || 'http://localhost:8123';
const CLICKHOUSE_DB = process.env.CLICKHOUSE_DB || 'dcim';

export async function queryClickHouse(query: string): Promise<any[]> {
  if (!process.env.CLICKHOUSE_URL) {
    const now = Date.now();
    return Array.from({length: 60}, (_, i) => {
      const t = new Date(now - (59-i)*60000);
      const baseLoad = 1240 + Math.sin(i/10)*80 + Math.random()*30;
      return {
        timestamp: t.toISOString(),
        grid_kw: baseLoad * 1.05,
        ups_kw: baseLoad,
        pdu_kw: baseLoad * 0.98,
        rack_kw: baseLoad * 0.85 / 6,
        cell_temp: 32 + Math.sin(i/5)*2 + Math.random()*1.5,
        voltage: 415 + (Math.random()-0.5)*5,
        current: baseLoad / 0.4
      }
    });
  }
  try {
    const res = await fetch(CLICKHOUSE_URL, {
      method: 'POST',
      headers: {'Content-Type': 'text/plain'},
      body: query + ' FORMAT JSON',
    });
    const json = await res.json();
    return json.data || [];
  } catch(e) {
    console.error('ClickHouse query failed', e);
    return [];
  }
}

export async function getPowerTimeseries(rackId?: string): Promise<PowerPoint[]> {
  const q = `
    SELECT
      toStartOfMinute(timestamp) as timestamp,
      avg(grid_power_kw) as grid_kw,
      avg(ups_power_kw) as ups_kw,
      avg(pdu_power_kw) as pdu_kw,
      avg(rack_power_kw) as rack_kw,
      avg(battery_cell_temp) as cell_temp,
      avg(voltage) as voltage
    FROM ${CLICKHOUSE_DB}.power_metrics
    WHERE timestamp >= now() - INTERVAL 1 HOUR
    ${rackId ? `AND rack_id='${rackId}'` : ''}
    GROUP BY timestamp
    ORDER BY timestamp ASC
  `;
  const data = await queryClickHouse(q);
  return data as PowerPoint[];
}

export async function getBatteryCells(rackId: string = 'RACK-05') {
  if (!process.env.CLICKHOUSE_URL) {
    return Array.from({length: 12}, (_, i) => ({
      cell_id: `CELL-${String(i+1).padStart(2,'0')}`,
      rack_id: rackId,
      voltage: 3.65 + (Math.random()-0.5)*0.1,
      temp: 30 + Math.random()*8 + (i===5? 12 : 0),
      soc: 92 - i*0.5 + Math.random()*2,
      status: i===5 ? 'warning' : 'ok',
      last_update: new Date().toISOString()
    }));
  }
  const q = `SELECT cell_id, voltage, temp, soc, status FROM ${CLICKHOUSE_DB}.battery_cells WHERE rack_id='${rackId}' ORDER BY cell_id`;
  return await queryClickHouse(q);
}
