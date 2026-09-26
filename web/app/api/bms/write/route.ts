import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const allowed = Boolean(process.env.BMS_URL) && process.env.BMS_WRITE === '1';
  if (!allowed) {
    return NextResponse.json(
      {
        ok: false,
        written: false,
        reason: 'BMS_URL + BMS_WRITE=1 requis. Aucune trame BACnet/Modbus émise.',
        point: body.point || null,
        value: body.value ?? null
      },
      { status: 403 }
    );
  }
  return NextResponse.json({
    ok: false,
    written: false,
    reason: 'Connecteur BMS non implémenté — journal seulement.',
    point: body.point,
    value: body.value
  });
}
