import { NextRequest, NextResponse } from 'next/server';
import { clampHours, getPowerTimeseries } from '@/lib/clickhouse';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || undefined;
  const hours = clampHours(req.nextUrl.searchParams.get('hours'));
  try {
    const result = await getPowerTimeseries(rack, hours);
    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-History-Hours': String(hours),
        'X-DCIM-Data-Source': result.source
      }
    });
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
