import { Module } from '@nestjs/common';
import { NetworkResolver } from './network.resolver';
import { NetworkService } from './network.service';
import { RedisPubSubModule } from './redis-pubsub.module';
import { TopologyResolver } from './topology.resolver';
import { TopologyService } from './topology.service';

@Module({
  imports: [RedisPubSubModule],
  providers: [TopologyService, NetworkService, TopologyResolver, NetworkResolver],
})
export class TopologyModule {}
