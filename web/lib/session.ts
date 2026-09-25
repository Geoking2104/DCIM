import { permissionsFromGroups, TenantPerm } from '@/lib/permissions';

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

function b64url(obj: unknown) {
  const s = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(s: string) {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return JSON.parse(atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad));
}

export async function createSessionToken(input: {
  email: string;
  roles?: string[];
  groups?: string[];
  tenants?: string[];
  permissions?: TenantPerm[];
}) {
  const exp = Date.now() + TTL_MS;
  const permissions = input.permissions || permissionsFromGroups(input.groups || [], input.roles || []);
  const tenants = input.tenants || permissions.map((p) => p.slug);
  const payload = b64url({
    email: input.email,
    exp,
    roles: input.roles || [],
    groups: input.groups || [],
    tenants,
    permissions
  });
  return `${payload}.${await hmac(payload)}`;
}

export async function readSessionToken(token?: string | null) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if ((await hmac(payload)) !== sig) return null;
  const data = fromB64url(payload);
  if (!data?.email || !data.exp || Date.now() > data.exp) return null;
  return {
    email: data.email as string,
    exp: data.exp as number,
    roles: (data.roles as string[]) || [],
    groups: (data.groups as string[]) || [],
    tenants: (data.tenants as string[]) || [],
    permissions: (data.permissions as TenantPerm[]) || []
  };
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
