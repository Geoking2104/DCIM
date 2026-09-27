import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || 'RACK-05';
  try {
    const result = await getPowerTimeseries(rack);
    const last = result.data[result.data.length - 1];
    const grid = Number(last?.grid_kw);
    const it = Number(last?.rack_kw || last?.pdu_kw);
    if (!last || !grid || !it) {
      return NextResponse.json({ ok: false, rack, error: 'Pas de point puissance' }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      rack,
      kind: 'pue_instant',
      value: grid / it,
      grid_kw: grid,
      it_kw: it,
      at: last.timestamp,
      official: false,
      source: result.source
    }, { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': result.source } });
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
