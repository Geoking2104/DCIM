import { ApolloError } from '@apollo/client';

export type GraphQLErrorKind =
  | 'offline'
  | 'cors'
  | 'timeout'
  | 'validation'
  | 'not_found'
  | 'server'
  | 'unknown';

export type ClassifiedGraphQLError = {
  kind: GraphQLErrorKind;
  title: string;
  detail: string;
  endpoint: string;
};

export function classifyGraphQLError(error: unknown, endpoint: string): ClassifiedGraphQLError {
  const message = error instanceof Error ? error.message : String(error || 'Unknown error');
  const apollo = error instanceof ApolloError ? error : null;
  const network = apollo?.networkError as (Error & { statusCode?: number; result?: { errors?: { message: string }[] } }) | null;
  const gqlMessages = apollo?.graphQLErrors?.map((e) => e.message) || [];
  const combined = [message, ...gqlMessages, network?.message].filter(Boolean).join(' | ');

  if (/Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND|Load failed|Network request failed/i.test(combined)) {
    const isLocal = /localhost|127\.0\.0\.1/.test(endpoint);
    return {
      kind: 'offline',
      title: 'Topology GraphQL injoignable',
      detail: isLocal
        ? `L’UI appelle ${endpoint}, inaccessible depuis Vercel. Démarre dcim-topology-service et expose NEXT_PUBLIC_GRAPHQL_URL.`
        : `Pas de réponse HTTP depuis ${endpoint}.`,
      endpoint
    };
  }

  if (/CORS|Access-Control-Allow-Origin/i.test(combined)) {
    return {
      kind: 'cors',
      title: 'CORS bloqué',
      detail: `Le navigateur refuse ${endpoint}. Active CORS sur le service topology pour l’origine Vercel.`,
      endpoint
    };
  }

  if (/timeout|ETIMEDOUT|AbortError/i.test(combined)) {
    return {
      kind: 'timeout',
      title: 'Timeout GraphQL',
      detail: `${endpoint} n’a pas répondu à temps.`,
      endpoint
    };
  }

  if (/Cannot query field|Unknown argument|Unknown type|Field .* doesn't exist/i.test(combined)) {
    return {
      kind: 'validation',
      title: 'Requête hors schéma',
      detail: gqlMessages[0] || 'Le client demande des champs absents du CSoT (ex. powerLoad / pue).',
      endpoint
    };
  }

  if (/not found|NotFound/i.test(combined) || network?.statusCode === 404) {
    return {
      kind: 'not_found',
      title: 'Ressource absente',
      detail: gqlMessages[0] || 'Le resolver a renvoyé NotFoundException.',
      endpoint
    };
  }

  if ((network?.statusCode && network.statusCode >= 500) || /Internal server error|500/.test(combined)) {
    return {
      kind: 'server',
      title: 'Erreur serveur GraphQL',
      detail: gqlMessages[0] || message,
      endpoint
    };
  }

  return {
    kind: 'unknown',
    title: 'Erreur GraphQL',
    detail: gqlMessages[0] || message,
    endpoint
  };
}
