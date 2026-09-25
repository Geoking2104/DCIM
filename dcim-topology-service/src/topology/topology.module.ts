import { Module } from '@nestjs/common';
import { RedisPubSubModule } from './redis-pubsub.module';
import { TopologyResolver } from './topology.resolver';
import { TopologyService } from './topology.service';

@Module({
  imports: [RedisPubSubModule],
  providers: [TopologyService, TopologyResolver],
})
export class TopologyModule {}
