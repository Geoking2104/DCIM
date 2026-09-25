import { NextRequest, NextResponse } from 'next/server';
import { authEndpoints, keycloakConfigured, pkceChallenge, randomString, redirectUri } from '@/lib/keycloak';

export async function GET(req: NextRequest) {
  if (!keycloakConfigured()) {
    return NextResponse.json({ error: 'Keycloak non configuré (KEYCLOAK_ISSUER / KEYCLOAK_CLIENT_ID)' }, { status: 501 });
  }
  const next = req.nextUrl.searchParams.get('next') || '/fr/plateforme';
  const verifier = randomString(48);
  const challenge = await pkceChallenge(verifier);
  const state = randomString(16);
  const origin = req.nextUrl.origin;
  const url = new URL(authEndpoints().authorize);
  url.searchParams.set('client_id', process.env.KEYCLOAK_CLIENT_ID || '');
  url.searchParams.set('redirect_uri', redirectUri(origin));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', state);
  url.searchParams.set('code_challenge', challenge);
  url.searchParams.set('code_challenge_method', 'S256');

  const res = NextResponse.redirect(url.toString());
  res.cookies.set({ name: 'kc_verifier', value: verifier, httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 600 });
  res.cookies.set({ name: 'kc_state', value: `${state}|${next}`, httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 600 });
  return res;
}
