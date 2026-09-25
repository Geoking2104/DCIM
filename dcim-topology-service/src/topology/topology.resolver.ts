import { Inject } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CurrentUser } from '../auth/current-user.decorator';
import { KeycloakUser } from '../auth/keycloak-user';
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
  createRack(@Args('input') input: CreateRackInput) {
    return this.topologyService.createRack(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Rack)
  updateRack(@Args('input') input: UpdateRackInput) {
    return this.topologyService.updateRack(input);
  }

  @Roles('qinode-admin')
  @Mutation(() => Boolean)
  deleteRack(@Args('id', { type: () => ID }) id: string) {
    return this.topologyService.deleteRack(id);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  createDeviceAndMount(@Args('input') input: CreateDeviceInput) {
    return this.topologyService.createDeviceAndMount(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  updateDevice(@Args('input') input: UpdateDeviceInput) {
    return this.topologyService.updateDevice(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Device)
  moveDevice(@Args('input') input: MoveDeviceInput) {
    return this.topologyService.moveDevice(input);
  }

  @Roles('qinode-ops', 'qinode-admin')
  @Mutation(() => Boolean)
  unmountDevice(@Args('id', { type: () => ID }) id: string) {
    return this.topologyService.unmountDevice(id);
  }

  @Query(() => Rack, { name: 'rack' })
  getRack(@Args('id', { type: () => ID }) id: string) {
    return this.topologyService.getRackWithDevices(id);
  }

  @Query(() => [Rack], { name: 'racks' })
  listRacks() {
    return this.topologyService.listRacks();
  }

  @Subscription(() => Rack, {
    name: 'rackUpdated',
    filter: (payload: TopologyEventPayloads[TopologyEvents.RACK_UPDATED], variables: RackSubscriptionVariables) =>
      !variables.rackId || payload.rackUpdated.id === variables.rackId,
  })
  rackUpdated(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.RACK_UPDATED);
  }

  @Subscription(() => Device, {
    name: 'deviceMounted',
    filter: (payload: TopologyEventPayloads[TopologyEvents.DEVICE_MOUNTED], variables: RackSubscriptionVariables) =>
      !variables.rackId || payload.rackId === variables.rackId,
  })
  deviceMounted(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.DEVICE_MOUNTED);
  }

  @Subscription(() => TopologyLifecycleEvent, {
    name: 'topologyLifecycle',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.LIFECYCLE],
      variables: RackSubscriptionVariables,
    ) => !variables.rackId || payload.topologyLifecycle.rackId === variables.rackId,
  })
  topologyLifecycle(@Args('rackId', { type: () => ID, nullable: true }) _rackId?: string) {
    return this.pubSub.asyncIterableIterator(TopologyEvents.LIFECYCLE);
  }
}
