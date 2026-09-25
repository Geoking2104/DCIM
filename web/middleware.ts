import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/session';
import { canAccessPath, rolesOnTenant } from '@/lib/permissions';
import { TENANT_COOKIE } from '@/lib/tenants';

const intl = createMiddleware({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  localeDetection: false
});

const PROTECTED = /^\/(fr|en)\/(plateforme|power|modules|eed)(\/|$)/;

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PROTECTED.test(pathname)) {
    const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
    if (!session) {
      const locale = pathname.split('/')[1] || 'fr';
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    const tenant = req.cookies.get(TENANT_COOKIE)?.value || session.tenants?.[0] || '';
    const tenantRoles = rolesOnTenant(session.permissions || [], tenant, session.roles || []);
    const effective = tenantRoles.length ? tenantRoles : session.roles || [];
    if (!canAccessPath(pathname, effective)) {
      const locale = pathname.split('/')[1] || 'fr';
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('error', 'forbidden');
      url.searchParams.set('tenant', tenant);
      return NextResponse.redirect(url);
    }
  }
  return intl(req);
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*']
};
