export type AlertEvent = {
  at: string;
  title: string;
  status: string;
  raw: unknown;
};

const MAX = 50;
const box: AlertEvent[] = [];

export function pushAlert(raw: any): AlertEvent {
  const ev: AlertEvent = {
    at: new Date().toISOString(),
    title: raw?.title || raw?.alerts?.[0]?.labels?.alertname || 'grafana',
    status: raw?.status || raw?.state || raw?.alerts?.[0]?.status || 'firing',
    raw
  };
  box.unshift(ev);
  if (box.length > MAX) box.pop();
  return ev;
}

export function listAlerts() {
  return box;
}
