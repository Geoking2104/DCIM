import { ForbiddenException, Inject } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakUser } from '../auth/keycloak-user';
import { allowedSites, siteAllowed } from '../auth/tenant-scope';
import { Roles } from '../auth/roles.decorator';
import { CreateDeviceInput } from './dto/create-device.input';
import { CreateRackInput } from './dto/create-rack.input';
import { MoveDeviceInput } from './dto/move-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';
import { UpdateRackInput } from './dto/update-rack.input';
import { Device } from './models/device.model';
import { TopologyLifecycleEvent } from './models/lifecycle-event.model';
import { Rack } from './models/rack.model';
import { WhoAmI } from './models/whoami.model';
import {
  PUB_SUB,
  TopologyEventPayloads,
  TopologyEvents,
  TopologyPubSub,
} from './topology.constants';
import { TopologyService } from './topology.service';

interface RackSubscriptionVariables {
  rackId?: string;
}

type GqlCtx = { user?: KeycloakUser; tenant?: string };

@Resolver()
export class TopologyResolver {
  constructor(
    private readonly topologyService: TopologyService,
    @Inject(PUB_SUB) private readonly pubSub: TopologyPubSub,
  ) {}

  @Query(() => WhoAmI, { name: 'me', nullable: true })
  me(@CurrentUser() user?: KeycloakUser): WhoAmI | null {
    if (!user) return null;
    return { sub: user.sub, email: user.email, roles: user.roles, groups: user.groups, tenants: user.tenants };
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Rack)
  createRack(
    @Args('input') input: CreateRackInput,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    if (!siteAllowed(scope, input.siteId)) {
      throw new ForbiddenException('Site hors périmètre tenant');
    }
    return this.topologyService.createRack(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Rack)
  async updateRack(
    @Args('input') input: UpdateRackInput,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const existing = await this.topologyService.getRackWithDevices(input.id);
    if (!siteAllowed(scope, existing.siteId)) {
      throw new ForbiddenException('Rack hors périmètre tenant');
    }
    if (input.siteId && !siteAllowed(scope, input.siteId)) {
      throw new ForbiddenException('Site cible hors périmètre tenant');
    }
    return this.topologyService.updateRack(input);
  }

  @Roles('qinode-admin')
  @Mutation(() => Boolean)
  async deleteRack(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const existing = await this.topologyService.getRackWithDevices(id);
    if (!siteAllowed(scope, existing.siteId)) {
      throw new ForbiddenException('Rack hors périmètre tenant');
    }
    return this.topologyService.deleteRack(id);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  async createDeviceAndMount(
    @Args('input') input: CreateDeviceInput,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const rack = await this.topologyService.getRackWithDevices(input.rackId);
    if (!siteAllowed(scope, rack.siteId)) {
      throw new ForbiddenException('Rack cible hors périmètre tenant');
    }
    return this.topologyService.createDeviceAndMount(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  async updateDevice(
    @Args('input') input: UpdateDeviceInput,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const site = await this.topologyService.deviceRackSite(input.id);
    if (!siteAllowed(scope, site)) {
      throw new ForbiddenException('Device hors périmètre tenant');
    }
    return this.topologyService.updateDevice(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  async moveDevice(
    @Args('input') input: MoveDeviceInput,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const currentSite = await this.topologyService.deviceRackSite(input.deviceId);
    if (!siteAllowed(scope, currentSite)) {
      throw new ForbiddenException('Device hors périmètre tenant');
    }
    const target = await this.topologyService.getRackWithDevices(input.rackId);
    if (!siteAllowed(scope, target.siteId)) {
      throw new ForbiddenException('Rack cible hors périmètre tenant');
    }
    return this.topologyService.moveDevice(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Boolean)
  async unmountDevice(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const site = await this.topologyService.deviceRackSite(id);
    if (!siteAllowed(scope, site)) {
      throw new ForbiddenException('Device hors périmètre tenant');
    }
    return this.topologyService.unmountDevice(id);
  }

  @Query(() => Rack, { name: 'rack' })
  async getRack(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user?: KeycloakUser,
    @Context() ctx?: GqlCtx,
  ) {
    const scope = allowedSites(user, ctx?.tenant);
    const rack = await this.topologyService.getRackWithDevices(id);
    if (!siteAllowed(scope, rack.siteId)) {
      throw new ForbiddenException('Rack hors périmètre tenant');
    }
    return rack;
  }

  @Query(() => [Rack], { name: 'racks' })
  async listRacks(@CurrentUser() user?: KeycloakUser, @Context() ctx?: GqlCtx) {
    const scope = allowedSites(user, ctx?.tenant);
    const racks = await this.topologyService.listRacks();
    if (scope === 'all') return racks;
    return racks.filter((rack) => siteAllowed(scope, rack.siteId));
  }

  @Subscription(() => Rack, {
    name: 'rackUpdated',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.RACK_UPDATED],
      variables: RackSubscriptionVariables,
      context: GqlCtx,
    ) => {
      const scope = allowedSites(context?.user, context?.tenant);
      if (!siteAllowed(scope, payload.rackUpdated?.siteId)) return false;
      return !variables.rackId || payload.rackUpdated.id === variables.rackId;
    },
  })
  rackUpdated(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.RACK_UPDATED);
  }

  @Subscription(() => Device, {
    name: 'deviceMounted',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.DEVICE_MOUNTED],
      variables: RackSubscriptionVariables,
      context: GqlCtx,
    ) => {
      const scope = allowedSites(context?.user, context?.tenant);
      if (!siteAllowed(scope, payload.rackSiteId)) return false;
      return !variables.rackId || payload.rackId === variables.rackId;
    },
  })
  deviceMounted(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.DEVICE_MOUNTED);
  }

  @Subscription(() => TopologyLifecycleEvent, {
    name: 'topologyLifecycle',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.LIFECYCLE],
      variables: RackSubscriptionVariables,
      context: GqlCtx,
    ) => {
      const scope = allowedSites(context?.user, context?.tenant);
      if (!siteAllowed(scope, payload.topologyLifecycle.rack?.siteId)) return false;
      return !variables.rackId || payload.topologyLifecycle.rackId === variables.rackId;
    },
  })
  topologyLifecycle(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.LIFECYCLE);
  }
}
