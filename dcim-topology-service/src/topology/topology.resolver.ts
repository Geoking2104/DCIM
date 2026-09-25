import { Inject } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { CreateDeviceInput } from './dto/create-device.input';
import { CreateRackInput } from './dto/create-rack.input';
import { Device } from './models/device.model';
import { Rack } from './models/rack.model';
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

  @Mutation(() => Rack)
  async createRack(@Args('input') input: CreateRackInput): Promise<Rack> {
    return this.topologyService.createRack(input);
  }

  @Mutation(() => Device)
  async createDeviceAndMount(@Args('input') input: CreateDeviceInput): Promise<Device> {
    return this.topologyService.createDeviceAndMount(input);
  }

  @Query(() => Rack, { name: 'rack' })
  async getRack(@Args('id', { type: () => ID }) id: string): Promise<Rack> {
    return this.topologyService.getRackWithDevices(id);
  }

  @Query(() => [Rack], { name: 'racks' })
  async listRacks(): Promise<Rack[]> {
    return this.topologyService.listRacks();
  }

  @Subscription(() => Rack, {
    name: 'rackUpdated',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.RACK_UPDATED],
      variables: RackSubscriptionVariables,
    ) => !variables.rackId || payload.rackUpdated.id === variables.rackId,
  })
  rackUpdated(
    @Args('rackId', { type: () => ID, nullable: true }) _rackId?: string,
  ): AsyncIterable<TopologyEventPayloads[TopologyEvents.RACK_UPDATED]> {
    return this.pubSub.asyncIterableIterator(TopologyEvents.RACK_UPDATED);
  }

  @Subscription(() => Device, {
    name: 'deviceMounted',
    filter: (
      payload: TopologyEventPayloads[TopologyEvents.DEVICE_MOUNTED],
      variables: RackSubscriptionVariables,
    ) => !variables.rackId || payload.rackId === variables.rackId,
  })
  deviceMounted(
    @Args('rackId', { type: () => ID, nullable: true }) _rackId?: string,
  ): AsyncIterable<TopologyEventPayloads[TopologyEvents.DEVICE_MOUNTED]> {
    return this.pubSub.asyncIterableIterator(TopologyEvents.DEVICE_MOUNTED);
  }
}
