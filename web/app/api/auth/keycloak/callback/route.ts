import { NextRequest, NextResponse } from 'next/server';
import { authEndpoints, redirectUri } from '@/lib/keycloak';
import { createSessionToken, sessionCookieName } from '@/lib/session';
import { extractKeycloakRoles, ROLES } from '@/lib/roles';
import { extractKeycloakGroups, rolesFromGroups, tenantsFromGroups } from '@/lib/groups';
import { permissionsFromGroups } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const stored = req.cookies.get('kc_state')?.value || '';
  const [expectedState, nextPath] = stored.split('|');
  const verifier = req.cookies.get('kc_verifier')?.value;

  if (!code || !state || state !== expectedState || !verifier) {
    return NextResponse.redirect(new URL('/fr/login?error=oauth_state', req.url));
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: process.env.KEYCLOAK_CLIENT_ID || '',
    redirect_uri: redirectUri(req.nextUrl.origin),
    code_verifier: verifier
  });
  if (process.env.KEYCLOAK_CLIENT_SECRET) body.set('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);

  const tokenRes = await fetch(authEndpoints().token, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.access_token) {
    return NextResponse.redirect(new URL('/fr/login?error=oauth_token', req.url));
  }

  let email = 'keycloak-user';
  try {
    const ui = await fetch(authEndpoints().userinfo, { headers: { authorization: `Bearer ${tokens.access_token}` } });
    if (ui.ok) {
      const profile = await ui.json();
      email = profile.email || profile.preferred_username || email;
    }
  } catch {}

  const groups = extractKeycloakGroups(tokens.access_token);
  const roles = Array.from(new Set([...extractKeycloakRoles(tokens.access_token), ...rolesFromGroups(groups)]));
  const tenants = tenantsFromGroups(groups);
  const permissions = permissionsFromGroups(groups, roles);
  const session = await createSessionToken({
    email,
    roles: roles.length ? roles : [ROLES.VIEWER],
    groups,
    tenants: tenants.length ? tenants : permissions.map((p) => p.slug),
    permissions
  });

  const dest = nextPath && nextPath.startsWith('/') ? nextPath : '/fr/plateforme';
  const res = NextResponse.redirect(new URL(dest, req.url));
  const cookieBase = { httpOnly: true, sameSite: 'lax' as const, secure: true, path: '/' };
  res.cookies.set({ name: sessionCookieName(), value: session, ...cookieBase, maxAge: 60 * 60 * 12 });
  res.cookies.set({ name: 'kc_access', value: tokens.access_token, ...cookieBase, maxAge: tokens.expires_in || 300 });
  if (tokens.refresh_token) {
    res.cookies.set({ name: 'kc_refresh', value: tokens.refresh_token, ...cookieBase, maxAge: 60 * 60 * 24 * 7 });
  }
  res.cookies.set({ name: 'kc_verifier', value: '', path: '/', maxAge: 0 });
  res.cookies.set({ name: 'kc_state', value: '', path: '/', maxAge: 0 });
  return res;
}
