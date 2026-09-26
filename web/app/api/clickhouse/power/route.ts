import { NextRequest, NextResponse } from 'next/server';
import { clampHours, getPowerTimeseries } from '@/lib/clickhouse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  const hours = clampHours(req.nextUrl.searchParams.get('hours'));
  const data = await getPowerTimeseries(rack, hours);
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
      'X-History-Hours': String(hours)
    }
  });
}
