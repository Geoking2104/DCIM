import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakUser } from '../auth/keycloak-user';
import { Roles } from '../auth/roles.decorator';
import { DiscoverNetworkInput } from './dto/discover-network.input';
import { ImportPatchesInput } from './dto/import-patches.input';
import { ResolvePatchConflictInput } from './dto/resolve-conflict.input';
import { BlastRadius } from './models/impact.model';
import { PatchDecision } from './models/patch-decision.model';
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

  @Roles('qinode-admin')
  @Mutation(() => DiscoveryReport)
  resolvePatchConflict(
    @Args('input') input: ResolvePatchConflictInput,
    @CurrentUser() user?: KeycloakUser,
  ) {
    return this.network.resolveConflict(input, user?.email || user?.sub || 'unknown');
  }

  @Query(() => [NetworkLink], { name: 'networkLinks' })
  networkLinks(@Args('rackId', { type: () => ID }) rackId: string) {
    return this.network.linksForRack(rackId);
  }

  @Query(() => BlastRadius, { name: 'blastRadius' })
  blastRadius(@Args('id', { type: () => ID }) id: string) {
    return this.network.blastRadius(id);
  }

  @Query(() => [PatchDecision], { name: 'patchDecisions' })
  patchDecisions() {
    return this.network.listDecisions();
  }
}
