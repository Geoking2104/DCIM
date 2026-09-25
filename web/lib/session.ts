const COOKIE = 'qinode_session';
const TTL_MS = 1000 * 60 * 60 * 12;

function secret() {
  return process.env.AUTH_SECRET || process.env.AUTH_PASSWORD || 'change-me';
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function createSessionToken(email: string, roles: string[] = []) {
  const exp = Date.now() + TTL_MS;
  const roleStr = roles.join(',');
  const payload = `${email}|${exp}|${roleStr}`;
  return `${payload}|${await hmac(payload)}`;
}

export async function readSessionToken(token?: string | null) {
  if (!token) return null;
  const parts = token.split('|');
  if (parts.length < 3) return null;
  const email = parts[0];
  const exp = Number(parts[1]);
  const roleStr = parts.length >= 4 ? parts[2] : '';
  const sig = parts.length >= 4 ? parts.slice(3).join('|') : parts.slice(2).join('|');
  const payload = parts.length >= 4 ? `${email}|${exp}|${roleStr}` : `${email}|${exp}`;
  if (!email || !exp || Date.now() > exp) return null;
  const expected = await hmac(payload);
  if (expected !== sig) return null;
  const roles = roleStr ? roleStr.split(',').filter(Boolean) : ['qinode-operator'];
  return { email, exp, roles };
}

export function sessionCookieName() {
  return COOKIE;
}

export function expectedUser() {
  return process.env.AUTH_USER || 'ops@qinode.eu';
}

export function expectedPassword() {
  return process.env.AUTH_PASSWORD || '';
}
