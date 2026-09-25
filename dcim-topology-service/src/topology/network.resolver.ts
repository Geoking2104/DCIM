import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/roles.decorator';
import { DiscoverNetworkInput } from './dto/discover-network.input';
import { DiscoveryReport, NetworkLink } from './models/port.model';
import { NetworkService } from './network.service';

@Resolver()
export class NetworkResolver {
  constructor(private readonly network: NetworkService) {}

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => DiscoveryReport)
  discoverNetwork(@Args('input') input: DiscoverNetworkInput) {
    return this.network.discover(input);
  }

  @Query(() => [NetworkLink], { name: 'networkLinks' })
  networkLinks(@Args('rackId', { type: () => ID }) rackId: string) {
    return this.network.linksForRack(rackId);
  }
}
