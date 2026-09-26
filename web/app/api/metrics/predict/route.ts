import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';
import { forecastControl } from '@/lib/predictiveControl';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  const rows = await getPowerTimeseries(rack, 24);
  const out = forecastControl(rows, 12);
  return NextResponse.json(
    { ok: true, hoursIn: 24, hoursOut: 12, rack: rack || null, closedLoop: false, ...out },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
