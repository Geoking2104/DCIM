import { NextRequest, NextResponse } from 'next/server';
import { listAlerts, pushAlert } from '@/lib/alertInbox';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ items: listAlerts() }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => ({}));
  const ev = pushAlert(raw);
  console.info('[grafana-alert]', ev.title, ev.status);
  return NextResponse.json({ ok: true, at: ev.at });
}
