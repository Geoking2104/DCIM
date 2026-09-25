export const LAST_RACK_KEY = 'qinode.lastRack';

export function readLastRack() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LAST_RACK_KEY) || '';
}

export function writeLastRack(id: string) {
  if (typeof window === 'undefined' || !id) return;
  window.localStorage.setItem(LAST_RACK_KEY, id);
}
