import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

function makeClient() {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: new HttpLink({ uri: httpUrl, fetch }),
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
