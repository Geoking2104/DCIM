import { NextRequest, NextResponse } from 'next/server';
import { authEndpoints, keycloakConfigured } from '@/lib/keycloak';
import { sessionCookieName } from '@/lib/session';

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const res = NextResponse.redirect(new URL('/fr', origin));
  res.cookies.set({ name: sessionCookieName(), value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'kc_refresh', value: '', path: '/', maxAge: 0 });
  if (keycloakConfigured()) {
    const url = new URL(authEndpoints().logout);
    url.searchParams.set('client_id', process.env.KEYCLOAK_CLIENT_ID || '');
    url.searchParams.set('post_logout_redirect_uri', `${origin}/fr`);
    return NextResponse.redirect(url.toString());
  }
  return res;
}
