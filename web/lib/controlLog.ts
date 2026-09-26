export type ControlLog = {
  id: string;
  actionId: string;
  action: string;
  when: string;
  status: 'planned' | 'dismissed';
  at: string;
};

const box: ControlLog[] = [];

export function addControl(entry: Omit<ControlLog, 'id' | 'at'>): ControlLog {
  const row: ControlLog = {
    ...entry,
    id: `${Date.now()}-${entry.actionId}`,
    at: new Date().toISOString()
  };
  box.unshift(row);
  if (box.length > 40) box.pop();
  return row;
}

export function listControl() {
  return box;
}
