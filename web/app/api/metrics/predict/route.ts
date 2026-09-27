import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';
import { forecastControl } from '@/lib/predictiveControl';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  try {
    const result = await getPowerTimeseries(rack, 24);
    const out = forecastControl(result.data, 12);
    return NextResponse.json(
      { ok: true, hoursIn: 24, hoursOut: 12, rack: rack || null, closedLoop: false, ...out, source: result.source },
      { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
