import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { Neo4jModule } from './neo4j/neo4j.module';
import { TopologyModule } from './topology/topology.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
          onConnect: (ctx: { connectionParams?: { authorization?: string }; extra?: { request?: { headers?: Record<string, string> } } }) => {
            const auth = ctx.connectionParams?.authorization || ctx.extra?.request?.headers?.authorization;
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
