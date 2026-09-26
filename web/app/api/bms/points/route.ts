import { NextResponse } from 'next/server';
import { sampleBmsPoints } from '@/lib/bmsPoints';
import { listControl } from '@/lib/controlLog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const points = sampleBmsPoints();
  const planned = (await listControl()).filter((c) => c.status === 'planned').slice(0, 8);
  return NextResponse.json({
    ok: true,
    connected: Boolean(process.env.BMS_URL),
    protocol: process.env.BMS_PROTO || 'demo',
    closedLoop: false,
    points,
    pendingWrites: planned.map((p) => ({
      actionId: p.actionId,
      action: p.action,
      when: p.when,
      target: p.actionId === 'precool' ? 'AHU-1.SP' : p.actionId === 'crah-night' ? 'AHU-2.RUN' : null
    }))
  }, { headers: { 'Cache-Control': 'no-store' } });
}
