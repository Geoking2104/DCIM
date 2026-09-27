import { NextResponse } from 'next/server';
import { sampleBmsPoints } from '@/lib/bmsPoints';
import { listControl } from '@/lib/controlLog';
import { DataSourceUnavailableError, serverDemoModeEnabled } from '@/lib/dataMode';
import { dataSourceErrorResponse } from '@/lib/dataSourceResponse';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!serverDemoModeEnabled()) {
    return dataSourceErrorResponse(
      new DataSourceUnavailableError(
        'bms',
        'Connecteur BMS non implémenté ; aucune donnée réelle ne peut être retournée'
      )
    );
  }
  const points = sampleBmsPoints();
  const controls = await listControl();
  const planned = controls.data.filter((c) => c.status === 'planned').slice(0, 8);
  return NextResponse.json({
    ok: true,
    connected: Boolean(process.env.BMS_URL),
    source: 'demo',
    protocol: 'demo',
    closedLoop: false,
    points,
    pendingWrites: planned.map((p) => ({
      actionId: p.actionId,
      action: p.action,
      when: p.when,
      target: p.actionId === 'precool' ? 'AHU-1.SP' : p.actionId === 'crah-night' ? 'AHU-2.RUN' : null
    }))
  }, { headers: { 'Cache-Control': 'no-store', 'X-DCIM-Data-Source': 'demo' } });
}
