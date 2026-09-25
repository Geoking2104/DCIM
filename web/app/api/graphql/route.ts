import { NextRequest, NextResponse } from 'next/server';

const UPSTREAM = process.env.GRAPHQL_INTERNAL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('kc_access')?.value;
  const body = await req.text();
  const headers: Record<string, string> = {
    'content-type': req.headers.get('content-type') || 'application/json'
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const tenant = req.cookies.get('qinode_tenant')?.value;
  if (tenant) headers['x-tenant'] = tenant;

  try {
    const upstream = await fetch(UPSTREAM, { method: 'POST', headers, body });
    const text = await upstream.text();
    return new NextResponse(text, {
      status: upstream.status,
      headers: { 'content-type': upstream.headers.get('content-type') || 'application/json' }
    });
  } catch (e) {
    return NextResponse.json({
      errors: [{ message: `GraphQL upstream injoignable (${UPSTREAM}): ${(e as Error).message}` }]
    }, { status: 502 });
  }
}
