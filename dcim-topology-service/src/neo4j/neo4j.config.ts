import { ConfigService } from '@nestjs/config';

export const NEO4J_CONFIG = Symbol('NEO4J_CONFIG');

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export function createNeo4jConfig(configService: ConfigService): Neo4jConfig {
  return {
    uri: configService.get<string>('NEO4J_URI', 'bolt://localhost:7687'),
    username: configService.get<string>('NEO4J_USERNAME', 'neo4j'),
    password: configService.get<string>('NEO4J_PASSWORD', 'dcim_secure_password'),
    database: configService.get<string>('NEO4J_DATABASE', 'neo4j'),
  };
}
