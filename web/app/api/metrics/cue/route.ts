import { NextResponse } from 'next/server';
import { calcCue } from '@/lib/energyCalcs';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const b = await req.json();
  const r = calcCue(Number(b.co2_kg ?? b.co2), Number(b.it_kwh ?? b.it));
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 422 });
  const band = r.value < 0.05 ? 'tres_sobre' : r.value < 0.2 ? 'raisonnable' : 'carbone';
  return NextResponse.json({ kind: 'cue', value: r.value, band, official: false, source: 'fallback' });
}
