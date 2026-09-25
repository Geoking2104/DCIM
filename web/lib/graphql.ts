import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';
const wsUrl = httpUrl.replace('http','ws');

function makeClient() {
  const httpLink = new HttpLink({ uri: httpUrl });
  if (typeof window === 'undefined') {
    return new ApolloClient({ link: httpLink, cache: new InMemoryCache() });
  }
  const wsLink = new GraphQLWsLink(createClient({ url: wsUrl, retryAttempts: 5 }));
  const splitLink = split(
    ({ query }) => {
      const def = getMainDefinition(query);
      return def.kind === 'OperationDefinition' && def.operation === 'subscription';
    },
    wsLink,
    httpLink
  );
  return new ApolloClient({ link: splitLink, cache: new InMemoryCache() });
}
let client: ApolloClient<any> | null = null;
export function getClient() {
  if (!client) client = makeClient();
  return client;
}

export const RACKS_QUERY = `
  query Racks {
    racks { id name powerLoad capacity pue temperature status devices { id name power battery { cellTemp } } }
  }
`;

export const RACKS_SUBSCRIPTION = `
  subscription OnRackUpdate {
    rackUpdated { id powerLoad temperature pue status }
  }
`;
