import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Neo4jService } from '../neo4j/neo4j.service';
import { CreateDeviceInput } from './dto/create-device.input';
import { CreateRackInput } from './dto/create-rack.input';
import { MoveDeviceInput } from './dto/move-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';
import { UpdateRackInput } from './dto/update-rack.input';
import { Device } from './models/device.model';
import { LifecycleKind, TopologyLifecycleEvent } from './models/lifecycle-event.model';
import { Rack } from './models/rack.model';
import { PUB_SUB, TopologyEvents, TopologyPubSub } from './topology.constants';

@Injectable()
export class TopologyService {
  constructor(
    private readonly neo4jService: Neo4jService,
    @Inject(PUB_SUB) private readonly pubSub: TopologyPubSub,
  ) {}

  private async emit(event: TopologyLifecycleEvent) {
    await this.pubSub.publish(TopologyEvents.LIFECYCLE, { topologyLifecycle: event });
    if (event.rack) {
      await this.pubSub.publish(TopologyEvents.RACK_UPDATED, { rackUpdated: event.rack });
    }
    if (event.device && event.kind !== LifecycleKind.DEVICE_UNMOUNTED) {
      await this.pubSub.publish(TopologyEvents.DEVICE_MOUNTED, {
        deviceMounted: event.device,
        rackId: event.rackId || '',
      });
    }
  }

  private life(
    kind: LifecycleKind,
    extra: Partial<TopologyLifecycleEvent>,
  ): TopologyLifecycleEvent {
    return { kind, at: new Date().toISOString(), ...extra };
  }

  async createRack(input: CreateRackInput): Promise<Rack> {
    const id = randomUUID();
    const result = await this.neo4jService.write(
      `CREATE (r:Rack {id: $id, name: $name, heightU: $heightU, siteId: $siteId}) RETURN r`,
      { id, ...input },
    );
    const rack = this.mapRackProps(result.records[0].get('r').properties, []);
    await this.emit(this.life(LifecycleKind.RACK_CREATED, { rackId: rack.id, rack }));
    return rack;
  }

  async updateRack(input: UpdateRackInput): Promise<Rack> {
    const result = await this.neo4jService.write(
      `MATCH (r:Rack {id: $id})
       SET r.name = coalesce($name, r.name), r.heightU = coalesce($heightU, r.heightU), r.siteId = coalesce($siteId, r.siteId)
       RETURN r`,
      { id: input.id, name: input.name ?? null, heightU: input.heightU ?? null, siteId: input.siteId ?? null },
    );
    if (result.records.length === 0) throw new NotFoundException(`Rack ${input.id} not found`);
    const rack = await this.getRackWithDevices(input.id);
    await this.emit(this.life(LifecycleKind.RACK_UPDATED, { rackId: rack.id, rack }));
    return rack;
  }

  async deleteRack(id: string): Promise<boolean> {
    const result = await this.neo4jService.write(
      `MATCH (r:Rack {id: $id}) OPTIONAL MATCH (d:Device)-[:INSTALLED_IN]->(r) DETACH DELETE d, r RETURN $id AS id`,
      { id },
    );
    if (result.records.length === 0) throw new NotFoundException(`Rack ${id} not found`);
    await this.emit(this.life(LifecycleKind.RACK_DELETED, { rackId: id }));
    return true;
  }

  async createDeviceAndMount(input: CreateDeviceInput): Promise<Device> {
    const id = randomUUID();
    const result = await this.neo4jService.write(
      `MATCH (r:Rack {id: $rackId})
       CREATE (d:Device {id: $id, name: $name, model: $model, startU: $startU, heightU: $heightU})
       CREATE (d)-[:INSTALLED_IN {startU: $startU, heightU: $heightU}]->(r) RETURN d`,
      { id, ...input },
    );
    if (result.records.length === 0) throw new NotFoundException(`Rack ${input.rackId} not found`);
    const device = this.mapDevice(result.records[0].get('d').properties);
    const rack = await this.getRackWithDevices(input.rackId);
    await this.emit(this.life(LifecycleKind.DEVICE_MOUNTED, { rackId: input.rackId, deviceId: device.id, device, rack }));
    return device;
  }

  async updateDevice(input: UpdateDeviceInput): Promise<Device> {
    const result = await this.neo4jService.write(
      `MATCH (d:Device {id: $id}) OPTIONAL MATCH (d)-[m:INSTALLED_IN]->(r:Rack)
       SET d.name = coalesce($name, d.name), d.model = coalesce($model, d.model),
           d.startU = coalesce($startU, d.startU), d.heightU = coalesce($heightU, d.heightU),
           m.startU = coalesce($startU, m.startU), m.heightU = coalesce($heightU, m.heightU)
       RETURN d, r.id AS rackId`,
      { id: input.id, name: input.name ?? null, model: input.model ?? null, startU: input.startU ?? null, heightU: input.heightU ?? null },
    );
    if (result.records.length === 0) throw new NotFoundException(`Device ${input.id} not found`);
    const device = this.mapDevice(result.records[0].get('d').properties);
    const rackId = result.records[0].get('rackId');
    const rack = rackId ? await this.getRackWithDevices(rackId) : undefined;
    await this.emit(this.life(LifecycleKind.DEVICE_UPDATED, { rackId, deviceId: device.id, device, rack }));
    return device;
  }

  async moveDevice(input: MoveDeviceInput): Promise<Device> {
    const result = await this.neo4jService.write(
      `MATCH (d:Device {id: $deviceId}) MATCH (target:Rack {id: $rackId})
       OPTIONAL MATCH (d)-[old:INSTALLED_IN]->(:Rack) DELETE old
       CREATE (d)-[:INSTALLED_IN {startU: $startU, heightU: d.heightU}]->(target)
       SET d.startU = $startU RETURN d`,
      input,
    );
    if (result.records.length === 0) {
      throw new NotFoundException(`Device ${input.deviceId} or rack ${input.rackId} not found`);
    }
    const device = this.mapDevice(result.records[0].get('d').properties);
    const rack = await this.getRackWithDevices(input.rackId);
    await this.emit(this.life(LifecycleKind.DEVICE_MOVED, { rackId: input.rackId, deviceId: device.id, device, rack }));
    return device;
  }

  async unmountDevice(deviceId: string): Promise<boolean> {
    const loc = await this.neo4jService.read(
      `MATCH (d:Device {id: $deviceId})-[:INSTALLED_IN]->(r:Rack) RETURN r.id AS rackId`,
      { deviceId },
    );
    const rackId = loc.records[0]?.get('rackId');
    const result = await this.neo4jService.write(
      `MATCH (d:Device {id: $deviceId}) DETACH DELETE d RETURN $deviceId AS id`,
      { deviceId },
    );
    if (result.records.length === 0) throw new NotFoundException(`Device ${deviceId} not found`);
    const rack = rackId ? await this.getRackWithDevices(rackId) : undefined;
    await this.emit(this.life(LifecycleKind.DEVICE_UNMOUNTED, { rackId, deviceId, rack }));
    return true;
  }

  async listRacks(): Promise<Rack[]> {
    const result = await this.neo4jService.read(
      `MATCH (r:Rack) OPTIONAL MATCH (d:Device)-[:INSTALLED_IN]->(r) RETURN r, collect(d) AS devices ORDER BY r.name`,
      {},
    );
    return result.records.map((record) => this.mapRackRecord(record));
  }

  async getRackWithDevices(rackId: string): Promise<Rack> {
    const result = await this.neo4jService.read(
      `MATCH (r:Rack {id: $rackId}) OPTIONAL MATCH (d:Device)-[:INSTALLED_IN]->(r) RETURN r, collect(d) AS devices`,
      { rackId },
    );
    if (result.records.length === 0) throw new NotFoundException(`Rack ${rackId} not found`);
    return this.mapRackRecord(result.records[0]);
  }

  private num(v: any): number {
    return typeof v?.toNumber === 'function' ? v.toNumber() : Number(v);
  }
  private mapDevice(p: Record<string, any>): Device {
    return { id: p.id, name: p.name, model: p.model, startU: this.num(p.startU), heightU: this.num(p.heightU) };
  }
  private mapRackProps(p: Record<string, any>, devices: Device[]): Rack {
    return { id: p.id, name: p.name, heightU: this.num(p.heightU), siteId: p.siteId, devices };
  }
  private mapRackRecord(record: any): Rack {
    const devices: Device[] = record.get('devices')
      .filter((node: { properties?: Record<string, unknown> }) => node.properties)
      .map((node: { properties: Record<string, any> }) => this.mapDevice(node.properties));
    return this.mapRackProps(record.get('r').properties, devices);
  }
}
