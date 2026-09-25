import { NextResponse } from 'next/server';
import { computeMetric } from '@/lib/rustGateway';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const b = await req.json();
  try {
    const out = await computeMetric('pue', {
      facility_kwh: Number(b.facility_kwh ?? b.total),
      it_kwh: Number(b.it_kwh ?? b.it)
    });
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 422 });
  }
}
