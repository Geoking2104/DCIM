import { NextResponse } from 'next/server';
import { calcErf } from '@/lib/energyCalcs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const b = await req.json();
  const r = calcErf(Number(b.reused_kwh ?? b.reused), Number(b.facility_kwh ?? b.total));
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 422 });
  const band = r.value >= 0.2 ? 'cible_2028' : r.value >= 0.15 ? 'cible_2027' : r.value >= 0.1 ? 'cible_2026' : 'sous_seuil';
  return NextResponse.json({ kind: 'erf', value: r.value, band, official: false, source: 'fallback' });
}
