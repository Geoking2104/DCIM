import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateDeviceInput } from './dto/create-device.input';
import { CreateRackInput } from './dto/create-rack.input';
import { Device } from './models/device.model';
import { Rack } from './models/rack.model';
import { TopologyService } from './topology.service';

@Resolver()
export class TopologyResolver {
  constructor(private readonly topologyService: TopologyService) {}

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
}
