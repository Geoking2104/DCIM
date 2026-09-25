import { calcPue, calcWue } from '@/lib/energyCalcs';

const RUST = process.env.RUST_GATEWAY_URL || process.env.NEXT_PUBLIC_RUST_URL || 'http://127.0.0.1:8088';

export type MetricOut = {
  kind: string;
  value: number;
  band: string;
  official: boolean;
  source: 'rust' | 'fallback';
};

export async function computeMetric(
  kind: 'pue' | 'wue',
  body: Record<string, number>
): Promise<MetricOut> {
  try {
    const res = await fetch(`${RUST}/v1/metrics/${kind}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return { ...data, source: 'rust' };
    }
  } catch {
    /* sidecar absent — calcul local identique */
  }
  if (kind === 'pue') {
    const r = calcPue(body.facility_kwh, body.it_kwh);
    if (!r.ok) throw new Error(r.error);
    return { kind: 'pue', value: r.value, band: bandPue(r.value), official: false, source: 'fallback' };
  }
  const r = calcWue(body.water_liters, body.it_kwh);
  if (!r.ok) throw new Error(r.error);
  return { kind: 'wue', value: r.value, band: bandWue(r.value), official: false, source: 'fallback' };
}

function bandPue(v: number) {
  return v < 1.2 ? 'tres_efficace' : v < 1.4 ? 'bon' : v < 1.7 ? 'moyen' : 'a_travailler';
}
function bandWue(v: number) {
  return v < 0.2 ? 'tres_sobre' : v < 1 ? 'raisonnable' : 'gourmand';
}
