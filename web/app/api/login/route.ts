import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, expectedPassword, expectedUser, sessionCookieName } from '@/lib/session';
import { ROLES } from '@/lib/roles';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  const next = String(body.next || '/fr/plateforme');

  const userOk = email.toLowerCase() === expectedUser().toLowerCase();
  const passOk = expectedPassword() && password === expectedPassword();
  if (!userOk || !passOk) {
    return NextResponse.json({ ok: false, error: 'Identifiants incorrects' }, { status: 401 });
  }

  const token = await createSessionToken(email.toLowerCase(), [ROLES.ADMIN, ROLES.OPERATOR]);
  const res = NextResponse.json({ ok: true, next });
  res.cookies.set({
    name: sessionCookieName(),
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: 60 * 60 * 12
  });
  return res;
}
