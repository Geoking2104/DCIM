export type ControlLog = {
  id: string;
  actionId: string;
  action: string;
  when: string;
  status: 'planned' | 'dismissed';
  at: string;
};

const box: ControlLog[] = [];
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

export async function addControl(entry: Omit<ControlLog, 'id' | 'at'>): Promise<ControlLog> {
  const row: ControlLog = {
    ...entry,
    id: `${Date.now()}-${entry.actionId}`,
    at: new Date().toISOString()
  };
  box.unshift(row);
  if (box.length > 40) box.pop();
  try {
    if (CH) {
      await ch(`CREATE TABLE IF NOT EXISTS dcim.control_log (
        at DateTime64(3), action_id String, action String, planned_for DateTime64(3), status String
      ) ENGINE = MergeTree ORDER BY at`);
      await ch(
        `INSERT INTO dcim.control_log (at, action_id, action, planned_for, status) VALUES (now64(3), '${esc(row.actionId)}', '${esc(row.action)}', parseDateTimeBestEffort('${esc(row.when)}'), '${esc(row.status)}')`
      );
    }
  } catch (e) {
    console.warn('[control_log] clickhouse skip', e);
  }
  return row;
}

export async function listControl(): Promise<ControlLog[]> {
  if (CH) {
    try {
      const res = await fetch(CH, {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'SELECT at, action_id, action, planned_for, status FROM dcim.control_log ORDER BY at DESC LIMIT 40 FORMAT JSON'
      });
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length) {
        return json.data.map((r: any) => ({
          id: `${r.at}-${r.action_id}`,
          actionId: r.action_id,
          action: r.action,
          when: r.planned_for,
          status: r.status,
          at: r.at
        }));
      }
    } catch {
      /* mémoire */
    }
  }
  return box;
}
