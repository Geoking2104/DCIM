import { Global, Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis, { RedisOptions } from 'ioredis';
import { PUB_SUB, pubSub, TopologyPubSub } from './topology.constants';

@Global()
@Module({
  providers: [
    {
      provide: PUB_SUB,
      useFactory: (): TopologyPubSub => {
        const host = process.env.REDIS_HOST;

        if (!host) {
          return pubSub;
        }

        const password = process.env.REDIS_PASSWORD;
        const options: RedisOptions = {
          host,
          port: Number(process.env.REDIS_PORT || 6379),
          password: password || undefined,
          retryStrategy: (attempt: number) => Math.min(attempt * 50, 2000),
        };

        return new RedisPubSub({
          publisher: new Redis(options),
          subscriber: new Redis(options),
        });
      },
    },
  ],
  exports: [PUB_SUB],
})
export class RedisPubSubModule implements OnApplicationShutdown {
  constructor(@Inject(PUB_SUB) private readonly pubSub: TopologyPubSub) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pubSub.close?.();
  }
}
