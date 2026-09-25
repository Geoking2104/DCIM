import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Roles } from '../auth/roles.decorator';
import { DiscoverNetworkInput } from './dto/discover-network.input';
import { ImportPatchesInput } from './dto/import-patches.input';
import { BlastRadius } from './models/impact.model';
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

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => DiscoveryReport)
  importPatches(@Args('input') input: ImportPatchesInput) {
    return this.network.importPatches(input);
  }

  @Query(() => [NetworkLink], { name: 'networkLinks' })
  networkLinks(@Args('rackId', { type: () => ID }) rackId: string) {
    return this.network.linksForRack(rackId);
  }

  @Query(() => BlastRadius, { name: 'blastRadius' })
  blastRadius(@Args('id', { type: () => ID }) id: string) {
    return this.network.blastRadius(id);
  }
}
