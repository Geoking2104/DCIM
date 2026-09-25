import { NextRequest, NextResponse } from 'next/server';
import { getPowerTimeseries } from '@/lib/clickhouse';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  const data = await getPowerTimeseries(rack);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
