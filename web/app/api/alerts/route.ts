import { NextRequest, NextResponse } from 'next/server';
import { listAlerts, pushAlert } from '@/lib/alertInbox';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listAlerts();
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => ({}));
  const ev = await pushAlert(raw);
  console.info('[grafana-alert]', ev.title, ev.status);
  return NextResponse.json({ ok: true, at: ev.at });
}
