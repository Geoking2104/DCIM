import { PubSub } from 'graphql-subscriptions';
import { Device } from './models/device.model';
import { Rack } from './models/rack.model';

export const PUB_SUB = Symbol('PUB_SUB');

export enum TopologyEvents {
  RACK_UPDATED = 'rackUpdated',
  DEVICE_MOUNTED = 'deviceMounted',
}

export interface TopologyEventPayloads {
  [event: string]: unknown;
  [TopologyEvents.RACK_UPDATED]: {
    rackUpdated: Rack;
  };
  [TopologyEvents.DEVICE_MOUNTED]: {
    deviceMounted: Device;
    rackId: string;
  };
}

export interface TopologyPubSub {
  publish<K extends keyof TopologyEventPayloads & string>(
    triggerName: K,
    payload: TopologyEventPayloads[K],
  ): Promise<void>;
  asyncIterableIterator<T>(triggers: string | readonly string[]): AsyncIterable<T>;
  close?(): Promise<unknown>;
}

export const pubSub: TopologyPubSub = new PubSub<TopologyEventPayloads>();
