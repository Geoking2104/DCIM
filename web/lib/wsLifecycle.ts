export type WsPhase = 'idle' | 'connecting' | 'connected' | 'closed' | 'error';

type Listener = (phase: WsPhase, detail?: string) => void;

let phase: WsPhase = 'idle';
let detail = '';
const listeners = new Set<Listener>();

export function getWsPhase() {
  return { phase, detail };
}

export function setWsPhase(next: WsPhase, nextDetail = '') {
  phase = next;
  detail = nextDetail;
  listeners.forEach((fn) => fn(phase, detail));
}

export function onWsPhase(fn: Listener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
