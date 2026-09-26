import { NextRequest, NextResponse } from 'next/server';
import { addControl, listControl } from '@/lib/controlLog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listControl();
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  if (!body.actionId || !body.action) {
    return NextResponse.json({ error: 'actionId et action requis' }, { status: 400 });
  }
  const status = body.status === 'dismissed' ? 'dismissed' : 'planned';
  const row = await addControl({
    actionId: String(body.actionId),
    action: String(body.action),
    when: String(body.when || new Date().toISOString()),
    status
  });
  return NextResponse.json({ ok: true, item: row, closedLoop: false });
}
