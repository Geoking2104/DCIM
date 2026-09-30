/**
 * Lecture tolérante des propriétés Neo4j : pendant la période de lecture
 * parallèle Nest/Rust, des nœuds peuvent porter la convention Rust
 * (snake_case : height_u, site_id, start_u) en plus de la convention
 * historique camelCase. La lecture privilégie le camelCase, retombe sur le
 * snake_case, puis sur une valeur neutre — un nœud non conforme (ou un champ
 * écrit en flottant) ne doit jamais invalider la liste complète.
 *
 * Miroir du bridge côté Rust (`qinode-graph` : coalesce + toInteger).
 */

export function readNumber(
  properties: Record<string, unknown> | undefined,
  camel: string,
  snake: string,
  fallback = 0,
): number {
  const raw = properties?.[camel] ?? properties?.[snake];
  if (raw === undefined || raw === null) return fallback;
  const value =
    typeof (raw as { toNumber?: () => number }).toNumber === 'function'
      ? (raw as { toNumber: () => number }).toNumber()
      : Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

export function readString(
  properties: Record<string, unknown> | undefined,
  camel: string,
  snake: string,
  fallback = '',
): string {
  const raw = properties?.[camel] ?? properties?.[snake];
  return raw === undefined || raw === null ? fallback : String(raw);
}
