import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/session';
import { resolveTenants, TENANT_COOKIE } from '@/lib/tenants';
import { canAccessTenant, rolesOnTenant } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
  if (!session) return NextResponse.json({ authenticated: false, tenants: [] }, { status: 401 });
  const tenants = resolveTenants(session.tenants || []).map((t) => ({
    ...t,
    roles: rolesOnTenant(session.permissions || [], t.slug, session.roles || [])
  }));
  const active = req.cookies.get(TENANT_COOKIE)?.value || tenants[0]?.slug || null;
  return NextResponse.json({
    authenticated: true,
    active,
    tenants,
    email: session.email,
    roles: session.roles,
    permissions: session.permissions
  });
}

export async function POST(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const slug = String((await req.json().catch(() => ({}))).slug || '');
  if (!slug || !canAccessTenant(session.permissions || [], slug, session.roles || [])) {
    return NextResponse.json({ ok: false, error: 'tenant interdit' }, { status: 403 });
  }
  const res = NextResponse.json({
    ok: true,
    active: slug,
    roles: rolesOnTenant(session.permissions || [], slug, session.roles || [])
  });
  res.cookies.set({ name: TENANT_COOKIE, value: slug, httpOnly: false, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
