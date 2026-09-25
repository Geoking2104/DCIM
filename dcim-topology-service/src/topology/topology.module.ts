import { Module } from '@nestjs/common';
import { TopologyResolver } from './topology.resolver';
import { TopologyService } from './topology.service';

@Module({
  providers: [TopologyService, TopologyResolver],
})
export class TopologyModule {}
