import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const hook = process.env.MATURITE_WEBHOOK_URL || process.env.FORMSPREE_MATURITE;
  if (hook) {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 });
    return NextResponse.json({ ok: true, via: 'webhook' });
  }
  return NextResponse.json({
    ok: true,
    via: 'mailto',
    to: 'contact@qinode.eu',
    subject: `Diagnostic Qinode ${payload.global}/100`,
    body: payload.body
  });
}
