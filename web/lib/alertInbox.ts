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

export async function pushAlert(raw: any): Promise<AlertEvent> {
  const ev: AlertEvent = {
    at: new Date().toISOString(),
    title: String(raw?.title || raw?.alerts?.[0]?.labels?.alertname || 'grafana'),
    status: String(raw?.status || raw?.state || raw?.alerts?.[0]?.status || 'firing'),
    raw
  };
  box.unshift(ev);
  if (box.length > MAX) box.pop();
  try {
    if (CH) {
      await ensureAlertsTable();
      const payload = esc(JSON.stringify(raw).slice(0, 8000));
      await ch(`INSERT INTO dcim.alerts (at, title, status, payload) VALUES (now64(3), '${esc(ev.title)}', '${esc(ev.status)}', '${payload}')`);
    }
  } catch (e) {
    console.warn('[alerts] clickhouse skip', e);
  }
  return ev;
}

export async function listAlerts(): Promise<AlertEvent[]> {
  if (CH) {
    try {
      const res = await fetch(CH, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'SELECT at, title, status FROM dcim.alerts ORDER BY at DESC LIMIT 50 FORMAT JSON'
      });
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length) {
        return json.data.map((r: any) => ({ at: r.at, title: r.title, status: r.status, raw: null }));
      }
    } catch {
      /* fallback mémoire */
    }
  }
  return box;
}
