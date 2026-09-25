import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Neo4jService } from '../neo4j/neo4j.service';
import { CreateDeviceInput } from './dto/create-device.input';
import { CreateRackInput } from './dto/create-rack.input';
import { Device } from './models/device.model';
import { Rack } from './models/rack.model';
import { PUB_SUB, TopologyEvents, TopologyPubSub } from './topology.constants';

@Injectable()
export class TopologyService {
  constructor(
    private readonly neo4jService: Neo4jService,
    @Inject(PUB_SUB) private readonly pubSub: TopologyPubSub,
  ) {}

  async createRack(input: CreateRackInput): Promise<Rack> {
    const id = randomUUID();
    const cypher = `
      CREATE (r:Rack {id: $id, name: $name, heightU: $heightU, siteId: $siteId})
      RETURN r
    `;
    const result = await this.neo4jService.write(cypher, { id, ...input });
    const record = result.records[0].get('r').properties;

    const rack: Rack = {
      id: record.id,
      name: record.name,
      heightU: record.heightU.toNumber(),
      siteId: record.siteId,
    };

    await this.pubSub.publish(TopologyEvents.RACK_UPDATED, { rackUpdated: rack });
    return rack;
  }

  async createDeviceAndMount(input: CreateDeviceInput): Promise<Device> {
    const id = randomUUID();
    const cypher = `
      MATCH (r:Rack {id: $rackId})
      CREATE (d:Device {id: $id, name: $name, model: $model, startU: $startU, heightU: $heightU})
      CREATE (d)-[:INSTALLED_IN {startU: $startU, heightU: $heightU}]->(r)
      RETURN d
    `;
    const result = await this.neo4jService.write(cypher, { id, ...input });

    if (result.records.length === 0) {
      throw new NotFoundException(`Rack ${input.rackId} not found`);
    }

    const record = result.records[0].get('d').properties;
    const device: Device = {
      id: record.id,
      name: record.name,
      model: record.model,
      startU: record.startU.toNumber(),
      heightU: record.heightU.toNumber(),
    };

    await this.pubSub.publish(TopologyEvents.DEVICE_MOUNTED, {
      deviceMounted: device,
      rackId: input.rackId,
    });

    const updatedRack = await this.getRackWithDevices(input.rackId);
    await this.pubSub.publish(TopologyEvents.RACK_UPDATED, {
      rackUpdated: updatedRack,
    });

    return device;
  }

  async listRacks(): Promise<Rack[]> {
    const cypher = `
      MATCH (r:Rack)
      OPTIONAL MATCH (d:Device)-[:INSTALLED_IN]->(r)
      RETURN r, collect(d) AS devices
      ORDER BY r.name
    `;
    const result = await this.neo4jService.read(cypher, {});
    return result.records.map((record) => this.mapRackRecord(record));
  }

  async getRackWithDevices(rackId: string): Promise<Rack> {
    const cypher = `
      MATCH (r:Rack {id: $rackId})
      OPTIONAL MATCH (d:Device)-[:INSTALLED_IN]->(r)
      RETURN r, collect(d) AS devices
    `;
    const result = await this.neo4jService.read(cypher, { rackId });

    if (result.records.length === 0) {
      throw new NotFoundException(`Rack ${rackId} not found`);
    }

    return this.mapRackRecord(result.records[0]);
  }

  private mapRackRecord(record: any): Rack {
    const rackProperties = record.get('r').properties;
    const deviceNodes = record.get('devices');
    const devices: Device[] = deviceNodes
      .filter((node: { properties?: Record<string, unknown> }) => node.properties)
      .map((node: { properties: Record<string, any> }) => ({
        id: node.properties.id,
        name: node.properties.name,
        model: node.properties.model,
        startU: node.properties.startU.toNumber(),
        heightU: node.properties.heightU.toNumber(),
      }));

    return {
      id: rackProperties.id,
      name: rackProperties.name,
      heightU: rackProperties.heightU.toNumber(),
      siteId: rackProperties.siteId,
      devices,
    };
  }
}
