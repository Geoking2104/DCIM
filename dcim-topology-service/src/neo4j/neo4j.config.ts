export const NEO4J_CONFIG = Symbol('NEO4J_CONFIG');

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export function createNeo4jConfig(): Neo4jConfig {
  return {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    username: process.env.NEO4J_USERNAME || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'dcim_secure_password',
    database: process.env.NEO4J_DATABASE || 'neo4j',
  };
}
