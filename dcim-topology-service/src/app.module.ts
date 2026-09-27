import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { TopologyModule } from './topology/topology.module';

@Module({
  imports: [
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.KEYCLOAK_OPTIONAL === 'true',
      context: ({ req, connection }: { req?: unknown; connection?: { context?: unknown } }) =>
        connection?.context || { req },
      subscriptions: {
        'graphql-ws': {
          onConnect: (ctx) => {
            const extra = ctx.extra as {
              request?: { headers?: { authorization?: string } };
            };
            const parameterAuth = ctx.connectionParams?.authorization;
            const auth =
              typeof parameterAuth === 'string'
                ? parameterAuth
                : extra.request?.headers?.authorization;
            return { req: { headers: { authorization: auth } } };
          },
        },
      },
    }),
    Neo4jModule.forRootAsync(),
    TopologyModule,
  ],
})
export class AppModule {}
