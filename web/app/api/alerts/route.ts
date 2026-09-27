import { NextRequest, NextResponse } from 'next/server';
import { listAlerts, pushAlert } from '@/lib/alertInbox';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listAlerts();
    return NextResponse.json(
      { items: result.data, source: result.source },
      { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => ({}));
  try {
    const result = await pushAlert(raw);
    console.info('[grafana-alert]', result.data.title, result.data.status);
    return NextResponse.json(
      { ok: true, at: result.data.at, source: result.source },
      { headers: { 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
