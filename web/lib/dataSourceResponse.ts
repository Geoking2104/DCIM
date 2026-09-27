import { NextResponse } from 'next/server';
import { DataSourceUnavailableError } from '@/lib/dataMode';

export function dataSourceErrorResponse(error: unknown) {
  const unavailable =
    error instanceof DataSourceUnavailableError
      ? error
      : new DataSourceUnavailableError(
          'unknown',
          error instanceof Error ? error.message : 'source de données indisponible'
        );

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: unavailable.code,
        source: unavailable.source,
        message: unavailable.message
      }
    },
    {
      status: 503,
      headers: {
        'Cache-Control': 'no-store',
        'X-DCIM-Data-Source': 'unavailable'
      }
    }
  );
}
