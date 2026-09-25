import { NextRequest, NextResponse } from 'next/server';
import { readSessionToken, sessionCookieName } from '@/lib/session';

export async function GET(req: NextRequest) {
  const session = await readSessionToken(req.cookies.get(sessionCookieName())?.value);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, ...session });
}
