import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Device } from './device.model';
import { Rack } from './rack.model';

export enum LifecycleKind {
  RACK_CREATED = 'RACK_CREATED',
  RACK_UPDATED = 'RACK_UPDATED',
  RACK_DELETED = 'RACK_DELETED',
  DEVICE_MOUNTED = 'DEVICE_MOUNTED',
  DEVICE_UPDATED = 'DEVICE_UPDATED',
  DEVICE_MOVED = 'DEVICE_MOVED',
  DEVICE_UNMOUNTED = 'DEVICE_UNMOUNTED',
}

registerEnumType(LifecycleKind, { name: 'LifecycleKind' });

@ObjectType()
export class TopologyLifecycleEvent {
  @Field(() => LifecycleKind)
  kind!: LifecycleKind;

  @Field()
  at!: string;

  @Field(() => ID, { nullable: true })
  rackId?: string;

  @Field(() => ID, { nullable: true })
  deviceId?: string;

  @Field(() => Rack, { nullable: true })
  rack?: Rack;

  @Field(() => Device, { nullable: true })
  device?: Device;
}
