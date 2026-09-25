export function keycloakConfigured() {
  return Boolean(process.env.KEYCLOAK_ISSUER && process.env.KEYCLOAK_CLIENT_ID);
}

export function keycloakIssuer() {
  return (process.env.KEYCLOAK_ISSUER || '').replace(/\/$/, '');
}

export function authEndpoints() {
  const issuer = keycloakIssuer();
  return {
    authorize: `${issuer}/protocol/openid-connect/auth`,
    token: `${issuer}/protocol/openid-connect/token`,
    userinfo: `${issuer}/protocol/openid-connect/userinfo`,
    logout: `${issuer}/protocol/openid-connect/logout`
  };
}

export function redirectUri(origin: string) {
  return process.env.KEYCLOAK_REDIRECT_URI || `${origin}/api/auth/keycloak/callback`;
}

export function randomString(bytes = 32) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function pkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const bytes = new Uint8Array(digest);
  let str = '';
  bytes.forEach((b) => { str += String.fromCharCode(b); });
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
