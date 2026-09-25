import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Neo4jService } from '../neo4j/neo4j.service';
import { DiscoverNetworkInput } from './dto/discover-network.input';
import { BlastRadius, ImpactHop } from './models/impact.model';
import { DiscoveryReport, NetworkLink, Port } from './models/port.model';

@Injectable()
export class NetworkService {
  constructor(private readonly neo4j: Neo4jService) {}

  async discover(input: DiscoverNetworkInput): Promise<DiscoveryReport> {
    const rack = await this.neo4j.read(`MATCH (r:Rack {id: $id}) RETURN r`, { id: input.rackId });
    if (rack.records.length === 0) throw new NotFoundException(`Rack ${input.rackId} not found`);

    const devices = await this.neo4j.read(
      `MATCH (d:Device)-[:INSTALLED_IN]->(:Rack {id: $id}) RETURN d.id AS id, d.name AS name ORDER BY d.name`,
      { id: input.rackId },
    );
    const list = devices.records.map((r) => ({ id: r.get('id') as string, name: String(r.get('name')) }));
    if (list.length === 0) {
      return { rackId: input.rackId, source: input.source || 'lldp-sim', portsCreated: 0, linksCreated: 0, links: [] };
    }

    const tor = list.find((d) => /tor|sw|switch/i.test(d.name)) || list[list.length - 1];
    let portsCreated = 0;
    let linksCreated = 0;
    const links: NetworkLink[] = [];
    await this.ensurePort(tor.id, 'Eth1/1', '25G');
    let i = 2;
    for (const dev of list.filter((d) => d.id !== tor.id)) {
      const nic = await this.ensurePort(dev.id, 'nic0', '25G');
      const swp = await this.ensurePort(tor.id, `Eth1/${i}`, '25G');
      portsCreated += (nic.created ? 1 : 0) + (swp.created ? 1 : 0);
      const linked = await this.ensureLink(swp.port.id, nic.port.id, input.source || 'lldp-sim');
      if (linked.created) linksCreated += 1;
      links.push(linked.link);
      i += 1;
    }
    return { rackId: input.rackId, source: input.source || 'lldp-sim', portsCreated, linksCreated, links };
  }

  async linksForRack(rackId: string): Promise<NetworkLink[]> {
    const result = await this.neo4j.read(
      `MATCH (d:Device)-[:INSTALLED_IN]->(:Rack {id: $rackId})
       MATCH (d)-[:HAS_PORT]->(a:Port)-[p:PATCHED_TO]->(b:Port)
       RETURN a, b, p.via AS via, p.id AS id`,
      { rackId },
    );
    return result.records.map((rec) => ({
      id: rec.get('id') || `${rec.get('a').properties.id}-${rec.get('b').properties.id}`,
      via: rec.get('via') || 'lldp',
      a: this.mapPort(rec.get('a').properties),
      b: this.mapPort(rec.get('b').properties),
    }));
  }

  async blastRadius(originId: string): Promise<BlastRadius> {
    const result = await this.neo4j.read(
      `MATCH (start) WHERE start.id = $originId
       OPTIONAL MATCH path = (start)-[:HAS_PORT|PATCHED_TO|INSTALLED_IN*1..4]-(n)
       WITH start, n, min(length(path)) AS hop
       RETURN start, collect({id: n.id, labels: labels(n), name: coalesce(n.name, n.id), hop: hop}) AS hops`,
      { originId },
    );
    if (result.records.length === 0) {
      return { originId, hops: [{ id: originId, kind: 'unknown', label: originId, hop: 0 }] };
    }
    const hops: ImpactHop[] = [
      { id: originId, kind: 'origin', label: originId, hop: 0 },
      ...result.records[0]
        .get('hops')
        .filter((h: any) => h && h.id)
        .map((h: any) => ({
          id: h.id,
          kind: Array.isArray(h.labels) ? String(h.labels[0] || 'Node') : 'Node',
          label: String(h.name || h.id),
          hop: Number(h.hop) || 1,
        })),
    ];
    return { originId, hops };
  }

  private mapPort(p: Record<string, any>): Port {
    return { id: p.id, name: p.name, speed: p.speed, deviceId: p.deviceId };
  }

  private async ensurePort(deviceId: string, name: string, speed: string) {
    const existing = await this.neo4j.read(
      `MATCH (:Device {id: $deviceId})-[:HAS_PORT]->(p:Port {name: $name}) RETURN p`,
      { deviceId, name },
    );
    if (existing.records.length) {
      return { created: false, port: this.mapPort(existing.records[0].get('p').properties) };
    }
    const id = randomUUID();
    const written = await this.neo4j.write(
      `MATCH (d:Device {id: $deviceId})
       CREATE (p:Port {id: $id, name: $name, speed: $speed, deviceId: $deviceId})
       CREATE (d)-[:HAS_PORT]->(p) RETURN p`,
      { deviceId, id, name, speed },
    );
    return { created: true, port: this.mapPort(written.records[0].get('p').properties) };
  }

  private async ensureLink(aId: string, bId: string, via: string) {
    const existing = await this.neo4j.read(
      `MATCH (a:Port {id: $aId})-[p:PATCHED_TO]-(b:Port {id: $bId}) RETURN a, b, p`,
      { aId, bId },
    );
    if (existing.records.length) {
      const rec = existing.records[0];
      return {
        created: false,
        link: {
          id: rec.get('p').properties.id || `${aId}-${bId}`,
          via: rec.get('p').properties.via || via,
          a: this.mapPort(rec.get('a').properties),
          b: this.mapPort(rec.get('b').properties),
        },
      };
    }
    const id = randomUUID();
    const written = await this.neo4j.write(
      `MATCH (a:Port {id: $aId}), (b:Port {id: $bId})
       CREATE (a)-[p:PATCHED_TO {id: $id, via: $via, at: datetime()}]->(b) RETURN a, b, p`,
      { aId, bId, id, via },
    );
    const rec = written.records[0];
    return {
      created: true,
      link: { id, via, a: this.mapPort(rec.get('a').properties), b: this.mapPort(rec.get('b').properties) },
    };
  }
}
