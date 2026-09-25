import { NextRequest, NextResponse } from 'next/server';
import { getBatteryCells } from '@/lib/clickhouse';
export async function GET(req: NextRequest) {
  const rack = req.nextUrl.searchParams.get('rack') || 'RACK-05';
  const data = await getBatteryCells(rack);
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
