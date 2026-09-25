import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { classifyGraphQLError } from './graphqlErrors';

export const GRAPHQL_DIRECT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
export const GRAPHQL_URL = typeof window === 'undefined'
  ? GRAPHQL_DIRECT
  : '/api/graphql';

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  const classified = classifyGraphQLError(
    { graphQLErrors, networkError, message: networkError?.message || graphQLErrors?.[0]?.message || 'GraphQL error' },
    GRAPHQL_DIRECT
  );
  if (typeof window !== 'undefined') {
    console.warn(`[GraphQL ${classified.kind}] ${operation.operationName}: ${classified.detail}`);
  }
});

function makeClient() {
  const httpLink = new HttpLink({
    uri: typeof window === 'undefined' ? GRAPHQL_DIRECT : '/api/graphql',
    fetch,
    credentials: 'same-origin',
    fetchOptions: { cache: 'no-store' }
  });
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: ApolloLink.from([errorLink, httpLink]),
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
