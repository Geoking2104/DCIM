import { NextResponse } from 'next/server';
import { computeMetric } from '@/lib/rustGateway';
import { DataSourceUnavailableError } from '@/lib/dataMode';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const b = await req.json();
  try {
    const out = await computeMetric('pue', {
      facility_kwh: Number(b.facility_kwh ?? b.total),
      it_kwh: Number(b.it_kwh ?? b.it)
    });
    return NextResponse.json(out, { headers: { 'X-DCIM-Data-Source': out.source } });
  } catch (e: any) {
    if (e instanceof DataSourceUnavailableError) return dataSourceErrorResponse(e);
    return NextResponse.json({ error: e.message }, { status: 422 });
  }
}
