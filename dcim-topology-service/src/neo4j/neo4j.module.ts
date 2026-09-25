import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createNeo4jConfig, NEO4J_CONFIG } from './neo4j.config';
import { Neo4jService } from './neo4j.service';

@Global()
@Module({})
export class Neo4jModule {
  static forRootAsync(): DynamicModule {
    return {
      module: Neo4jModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: NEO4J_CONFIG,
          useFactory: createNeo4jConfig,
          inject: [ConfigService],
        },
        Neo4jService,
      ],
      exports: [Neo4jService],
    };
  }
}
