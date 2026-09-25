import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/session';
import { hasAnyRole, rolesForPath } from '@/lib/roles';

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
    const needed = rolesForPath(pathname);
    if (needed && !hasAnyRole(session.roles || [], needed)) {
      const locale = pathname.split('/')[1] || 'fr';
      const url = req.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set('error', 'forbidden');
      url.searchParams.set('need', needed.join(','));
      return NextResponse.redirect(url);
    }
  }
  return intl(req);
}

export const config = {
  matcher: ['/', '/(fr|en)/:path*']
};
