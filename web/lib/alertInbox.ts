import {
  DataResult,
  dataSourceUnavailable,
  normalizeDataSourceError,
  serverDemoModeEnabled
} from '@/lib/dataMode';

export type AlertEvent = {
  at: string;
  title: string;
  status: string;
  raw: unknown;
};

const MAX = 50;
const box: AlertEvent[] = [];
const CH = process.env.CLICKHOUSE_URL;

function esc(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function ch(query: string) {
  if (!CH) return null;
  const res = await fetch(CH, { method: 'POST', headers: { 'content-type': 'text/plain' }, body: query });
  if (!res.ok) throw new Error(await res.text());
  return res;
}

export async function ensureAlertsTable() {
  await ch(`CREATE TABLE IF NOT EXISTS dcim.alerts (
    at DateTime64(3),
    title String,
    status String,
    payload String
  ) ENGINE = MergeTree ORDER BY at`);
}

export async function pushAlert(raw: any): Promise<DataResult<AlertEvent>> {
  const ev: AlertEvent = {
    at: new Date().toISOString(),
    title: String(raw?.title || raw?.alerts?.[0]?.labels?.alertname || 'grafana'),
    status: String(raw?.status || raw?.state || raw?.alerts?.[0]?.status || 'firing'),
    raw
  };
  if (CH) {
    try {
      await ensureAlertsTable();
      const payload = esc(JSON.stringify(raw).slice(0, 8000));
      await ch(`INSERT INTO dcim.alerts (at, title, status, payload) VALUES (now64(3), '${esc(ev.title)}', '${esc(ev.status)}', '${payload}')`);
      return { data: ev, source: 'live' };
    } catch (error) {
      if (!serverDemoModeEnabled()) throw normalizeDataSourceError('clickhouse', error);
      console.warn('[alerts] ClickHouse unavailable; explicit demo memory store used', error);
    }
  } else if (!serverDemoModeEnabled()) {
    dataSourceUnavailable('clickhouse', 'CLICKHOUSE_URL n’est pas configurée pour le journal d’alertes');
  }
  box.unshift(ev);
  if (box.length > MAX) box.pop();
  return { data: ev, source: 'demo' };
}

export async function listAlerts(): Promise<DataResult<AlertEvent[]>> {
  if (CH) {
    try {
      const res = await fetch(CH, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'SELECT at, title, status FROM dcim.alerts ORDER BY at DESC LIMIT 50 FORMAT JSON'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 500)}`);
      const json = await res.json();
      const data = Array.isArray(json.data)
        ? json.data.map((r: any) => ({ at: r.at, title: r.title, status: r.status, raw: null }))
        : [];
      return { data, source: 'live' };
    } catch (error) {
      if (!serverDemoModeEnabled()) throw normalizeDataSourceError('clickhouse', error);
    }
  } else if (!serverDemoModeEnabled()) {
    dataSourceUnavailable('clickhouse', 'CLICKHOUSE_URL n’est pas configurée pour le journal d’alertes');
  }
  return { data: box, source: 'demo' };
}
