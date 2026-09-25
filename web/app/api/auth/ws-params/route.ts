import { NextRequest, NextResponse } from 'next/server';

/** Same-origin only: expose Bearer for graphql-ws connection_init (cookie httpOnly). */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('kc_access')?.value;
  if (!token) return NextResponse.json({ authorization: null }, { status: 204 });
  return NextResponse.json(
    { authorization: `Bearer ${token}` },
    { headers: { 'cache-control': 'no-store' } }
  );
}
