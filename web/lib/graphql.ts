import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const wsUrl = httpUrl.replace('http', 'ws');

function makeClient() {
  const httpLink = new HttpLink({ uri: httpUrl, fetch });
  const errorLink = onError(() => undefined);
  const base = ApolloLink.from([errorLink, httpLink]);

  if (typeof window === 'undefined') {
    return new ApolloClient({
      ssrMode: true,
      link: base,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' },
        query: { errorPolicy: 'ignore', fetchPolicy: 'no-cache' }
      }
    });
  }

  let wsLink: GraphQLWsLink | null = null;
  try {
    wsLink = new GraphQLWsLink(createClient({
      url: wsUrl,
      retryAttempts: 0,
      lazy: true,
      shouldRetry: () => false
    }));
  } catch {
    wsLink = null;
  }

  const link = wsLink
    ? split(
        ({ query }) => {
          const def = getMainDefinition(query);
          return def.kind === 'OperationDefinition' && def.operation === 'subscription';
        },
        wsLink,
        base
      )
    : base;

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { errorPolicy: 'all', fetchPolicy: 'no-cache' },
      query: { errorPolicy: 'all', fetchPolicy: 'no-cache' }
    }
  });
}

let client: ApolloClient<any> | null = null;
export function getClient() {
  if (!client) client = makeClient();
  return client;
}
