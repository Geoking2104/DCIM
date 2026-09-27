import { NextRequest, NextResponse } from 'next/server';
import { addControl, listControl } from '@/lib/controlLog';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await listControl();
    return NextResponse.json(
      { items: result.data, source: result.source },
      { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.actionId || !body.action) {
    return NextResponse.json({ error: 'actionId et action requis' }, { status: 400 });
  }
  const status = body.status === 'dismissed' ? 'dismissed' : 'planned';
  try {
    const result = await addControl({
      actionId: String(body.actionId),
      action: String(body.action),
      when: String(body.when || new Date().toISOString()),
      status
    });
    return NextResponse.json(
      { ok: true, item: result.data, closedLoop: false, source: result.source },
      { headers: { 'X-DCIM-Data-Source': result.source } }
    );
  } catch (error) {
    return dataSourceErrorResponse(error);
  }
}
