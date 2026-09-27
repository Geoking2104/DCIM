import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';
import { optimizeFromSeries } from '@/lib/energyOptimize';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  try {
    const result = await getPowerTimeseries(rack, 24);
    const out = optimizeFromSeries(result.data);
    return NextResponse.json(
      { ok: true, hours: 24, rack: rack || null, ...out, official: false, source: result.source },
      { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
