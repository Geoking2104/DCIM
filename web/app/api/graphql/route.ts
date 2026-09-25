import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function nestUrl() {
  return process.env.GRAPHQL_INTERNAL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://127.0.0.1:4000/graphql';
}

function rustUrl() {
  const base = process.env.RUST_GATEWAY_URL || process.env.NEXT_PUBLIC_RUST_URL || 'http://127.0.0.1:8088';
  return `${base.replace(/\/$/, '')}/graphql`;
}

function primary(): string {
  return (process.env.GRAPHQL_UPSTREAM || 'nest').toLowerCase() === 'rust' ? rustUrl() : nestUrl();
}

function fallback(): string | null {
  const mode = (process.env.GRAPHQL_UPSTREAM || 'nest').toLowerCase();
  return mode === 'rust' ? nestUrl() : rustUrl();
}

async function proxy(url: string, req: NextRequest, body: string) {
  const token = req.cookies.get('kc_access')?.value;
  const headers: Record<string, string> = {
    'content-type': req.headers.get('content-type') || 'application/json'
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const tenant = req.cookies.get('qinode_tenant')?.value;
  if (tenant) headers['x-tenant'] = tenant;
  const upstream = await fetch(url, { method: 'POST', headers, body, cache: 'no-store' });
  const text = await upstream.text();
  return { status: upstream.status, text, type: upstream.headers.get('content-type') || 'application/json' };
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const first = primary();
  try {
    const out = await proxy(first, req, body);
    if (out.status >= 500) throw new Error(`status ${out.status}`);
    return new NextResponse(out.text, {
      status: out.status,
      headers: { 'content-type': out.type, 'x-graphql-upstream': first }
    });
  } catch (e) {
    const second = fallback();
    if (second && second !== first) {
      try {
        const out = await proxy(second, req, body);
        return new NextResponse(out.text, {
          status: out.status,
          headers: { 'content-type': out.type, 'x-graphql-upstream': second, 'x-graphql-fallback': '1' }
        });
      } catch {
        /* both down */
      }
    }
    return NextResponse.json(
      {
        errors: [
          {
            message: `GraphQL injoignable (${first}): ${(e as Error).message}`
          }
        ]
      },
      { status: 502 }
    );
  }
}
