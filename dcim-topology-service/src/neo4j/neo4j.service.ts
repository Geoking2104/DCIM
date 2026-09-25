import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import neo4j, { Driver, QueryResult, Session } from 'neo4j-driver';
import { Neo4jConfig, NEO4J_CONFIG } from './neo4j.config';

@Injectable()
export class Neo4jService implements OnApplicationShutdown {
  private readonly driver: Driver;

  constructor(@Inject(NEO4J_CONFIG) private readonly config: Neo4jConfig) {
    this.driver = neo4j.driver(
      this.config.uri,
      neo4j.auth.basic(this.config.username, this.config.password),
    );
  }

  getDriver(): Driver {
    return this.driver;
  }

  getSession(database?: string): Session {
    return this.driver.session({ database: database || this.config.database });
  }

  async read(cypher: string, params?: Record<string, unknown>): Promise<QueryResult> {
    const session = this.getSession();
    try {
      return await session.executeRead((transaction) => transaction.run(cypher, params));
    } finally {
      await session.close();
    }
  }

  async write(cypher: string, params?: Record<string, unknown>): Promise<QueryResult> {
    const session = this.getSession();
    try {
      return await session.executeWrite((transaction) => transaction.run(cypher, params));
    } finally {
      await session.close();
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.driver.close();
  }
}
