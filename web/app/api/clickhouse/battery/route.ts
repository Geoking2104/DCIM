import { NextRequest, NextResponse } from 'next/server';
import { getBatteryCells } from '@/lib/clickhouse';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';
export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || 'RACK-05';
  try {
    const result = await getBatteryCells(rack);
    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'no-store',
        'X-DCIM-Data-Source': result.source
      }
    });
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
