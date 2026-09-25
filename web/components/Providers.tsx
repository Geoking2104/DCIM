'use client';
import { ApolloProvider } from '@apollo/client';
import { getClient } from '@/lib/graphql';
import { ReactNode } from 'react';
export default function Providers({children}:{children:ReactNode}){
  const client = getClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
