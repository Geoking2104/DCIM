import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/session';
import { resolveTenants, TENANT_COOKIE } from '@/lib/tenants';

export async function GET(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
  if (!session) return NextResponse.json({ authenticated: false, tenants: [] }, { status: 401 });
  const tenants = resolveTenants(session.tenants || []);
  const active = req.cookies.get(TENANT_COOKIE)?.value || tenants[0]?.slug || null;
  return NextResponse.json({ authenticated: true, active, tenants, email: session.email, roles: session.roles });
}

export async function POST(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const slug = String(body.slug || '');
  const tenants = resolveTenants(session.tenants || []);
  const allowed = tenants.some((t) => t.slug === slug) || (session.roles || []).includes('qinode-admin');
  if (!slug || !allowed) return NextResponse.json({ ok: false, error: 'tenant interdit' }, { status: 403 });
  const res = NextResponse.json({ ok: true, active: slug });
  res.cookies.set({ name: TENANT_COOKIE, value: slug, httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
