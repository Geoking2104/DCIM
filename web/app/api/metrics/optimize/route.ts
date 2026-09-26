import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';
import { optimizeFromSeries } from '@/lib/energyOptimize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  const rows = await getPowerTimeseries(rack, 24);
  const out = optimizeFromSeries(rows);
  return NextResponse.json(
    { ok: true, hours: 24, rack: rack || null, ...out, official: false },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
