import { NextResponse } from 'next/server';
import { loadGroupMappings } from '@/lib/group-mappings';
import { ROLE_LABELS } from '@/lib/roles';

export async function GET() {
  return NextResponse.json({
    source: process.env.KEYCLOAK_GROUP_ROLE_MAP ? 'env+default' : 'default',
    mappings: loadGroupMappings(),
    roles: ROLE_LABELS
  });
}
