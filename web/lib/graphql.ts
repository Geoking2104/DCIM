import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import { createClient } from 'graphql-ws';
import { classifyGraphQLError } from './graphqlErrors';

export const GRAPHQL_DIRECT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
export const GRAPHQL_URL = typeof window === 'undefined' ? GRAPHQL_DIRECT : '/api/graphql';

export function graphqlWsUrl(): string {
  if (process.env.NEXT_PUBLIC_GRAPHQL_WS_URL) return process.env.NEXT_PUBLIC_GRAPHQL_WS_URL;
  const rust = (process.env.NEXT_PUBLIC_GRAPHQL_UPSTREAM || process.env.GRAPHQL_UPSTREAM || 'nest') === 'rust';
  if (rust) return 'ws://127.0.0.1:8088/graphql/ws';
  return GRAPHQL_DIRECT.replace(/^http/, 'ws');
}

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  const classified = classifyGraphQLError(
    { graphQLErrors, networkError, message: networkError?.message || graphQLErrors?.[0]?.message || 'GraphQL error' },
    GRAPHQL_DIRECT
  );
  if (typeof window !== 'undefined') {
    console.warn(`[GraphQL ${classified.kind}] ${operation.operationName}: ${classified.detail}`);
  }
});

function makeWsLink() {
  if (typeof window === 'undefined') return null;
  return new GraphQLWsLink(
    createClient({
      url: graphqlWsUrl(),
      lazy: true,
      retryAttempts: 8,
      shouldRetry: () => true,
      connectionParams: async () => {
        try {
          const res = await fetch('/api/auth/ws-params', { credentials: 'same-origin' });
          if (!res.ok) return {};
          return await res.json();
        } catch {
          return {};
        }
      }
    })
  );
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: typeof window === 'undefined' ? GRAPHQL_DIRECT : '/api/graphql',
    fetch,
    credentials: 'same-origin',
    fetchOptions: { cache: 'no-store' }
  });
  const wsLink = makeWsLink();
  const terminal =
    wsLink
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return def.kind === 'OperationDefinition' && def.operation === 'subscription';
          },
          wsLink,
          httpLink
        )
      : httpLink;
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([errorLink, terminal]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { errorPolicy: 'all', fetchPolicy: 'no-cache' },
      query: { errorPolicy: 'all', fetchPolicy: 'no-cache' }
    }
  });
}

let client: ApolloClient<unknown> | null = null;
export function getClient() {
  if (typeof window === 'undefined') return makeClient();
  if (!client) client = makeClient();
  return client;
}
