export type DataSourceName = 'clickhouse' | 'graphql' | 'rust' | 'bms' | 'tenant-catalog' | 'unknown';

export type DataResult<T> = {
  data: T;
  source: 'live' | 'demo';
};

export class DataSourceUnavailableError extends Error {
  readonly code = 'DATA_SOURCE_UNAVAILABLE';
  readonly source: DataSourceName;

  constructor(source: DataSourceName, message: string) {
    super(message);
    this.name = 'DataSourceUnavailableError';
    this.source = source;
  }
}

export function serverDemoModeEnabled(): boolean {
  return (
    process.env.DCIM_DEMO_MODE === 'true' &&
    process.env.NEXT_PUBLIC_DCIM_DEMO_MODE === 'true'
  );
}

export function dataSourceUnavailable(source: DataSourceName, detail: string): never {
  throw new DataSourceUnavailableError(
    source,
    `${source} indisponible : ${detail}. Activez explicitement DCIM_DEMO_MODE=true et NEXT_PUBLIC_DCIM_DEMO_MODE=true pour utiliser les données de démonstration.`
  );
}

export function normalizeDataSourceError(
  source: DataSourceName,
  error: unknown
): DataSourceUnavailableError {
  if (error instanceof DataSourceUnavailableError) return error;
  const detail = error instanceof Error ? error.message : String(error);
  return new DataSourceUnavailableError(source, `${source} indisponible : ${detail}`);
}
