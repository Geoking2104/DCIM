import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Neo4jService } from '../neo4j/neo4j.service';
import { DiscoverNetworkInput } from './dto/discover-network.input';
import { ImportPatchesInput } from './dto/import-patches.input';
import { ResolvePatchConflictInput } from './dto/resolve-conflict.input';
import { BlastRadius, ImpactHop } from './models/impact.model';
import { PatchDecision } from './models/patch-decision.model';
import { DiscoveryReport, NetworkLink, PatchConflict, Port } from './models/port.model';

type LinkAttempt =
  | { kind: 'created' | 'exists'; link: NetworkLink }
  | { kind: 'conflict'; conflict: PatchConflict };

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
    const empty = this.emptyReport(input.rackId, input.source || 'lldp-sim');
    if (!list.length) return empty;
    const tor = list.find((d) => /tor|sw|switch/i.test(d.name)) || list[list.length - 1];
    let i = 2;
    for (const dev of list.filter((d) => d.id !== tor.id)) {
      const nic = await this.ensurePort(dev.id, 'nic0', '25G');
      const swp = await this.ensurePort(tor.id, `Eth1/${i}`, '25G');
      empty.portsCreated += Number(nic.created) + Number(swp.created);
      this.applyAttempt(empty, await this.attemptLink(swp.port, nic.port, input.source || 'lldp-sim'));
      i += 1;
    }
    return empty;
  }

  async importPatches(input: ImportPatchesInput): Promise<DiscoveryReport> {
    const report = this.emptyReport(input.rackId, 'csv-patch');
    for (const row of input.rows) {
      const aDev = await this.resolveDevice(input.rackId, row.aDevice);
      const bDev = await this.resolveDevice(input.rackId, row.bDevice);
      if (!aDev || !bDev) {
        report.conflicts.push({
          reason: `device introuvable (${row.aDevice} / ${row.bDevice})`,
          wantedA: { id: row.aDevice, name: row.aPort, deviceId: row.aDevice },
          wantedB: { id: row.bDevice, name: row.bPort, deviceId: row.bDevice },
        });
        continue;
      }
      const a = await this.ensurePort(aDev, row.aPort, 'unknown');
      const b = await this.ensurePort(bDev, row.bPort, 'unknown');
      report.portsCreated += Number(a.created) + Number(b.created);
      this.applyAttempt(report, await this.attemptLink(a.port, b.port, 'csv-patch'));
    }
    return report;
  }

  async resolveConflict(input: ResolvePatchConflictInput, actor: string): Promise<DiscoveryReport> {
    const report = this.emptyReport('resolved', input.via || 'manual');
    const a = await this.portById(input.wantedAId);
    const b = await this.portById(input.wantedBId);
    if (!a || !b) throw new NotFoundException('Port du conflit introuvable');
    await this.logDecision(input.action, actor, a.id, b.id);
    if (input.action === 'keep') {
      report.conflicts.push({ reason: 'conservé tel quel', wantedA: a, wantedB: b });
      return report;
    }
    await this.neo4j.write(`MATCH (x:Port {id: $a})-[p:PATCHED_TO]-() DELETE p`, { a: a.id });
    await this.neo4j.write(`MATCH (y:Port {id: $b})-[p:PATCHED_TO]-() DELETE p`, { b: b.id });
    this.applyAttempt(report, await this.attemptLink(a, b, input.via || 'conflict-replace'));
    return report;
  }

  async listDecisions(): Promise<PatchDecision[]> {
    const r = await this.neo4j.read(
      `MATCH (d:PatchDecision) RETURN d ORDER BY d.at DESC LIMIT 50`,
      {},
    );
    return r.records.map((rec) => {
      const p = rec.get('d').properties;
      return { id: p.id, action: p.action, actor: p.actor, at: String(p.at), aId: p.aId, bId: p.bId };
    });
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
    if (!result.records.length) {
      return { originId, hops: [{ id: originId, kind: 'unknown', label: originId, hop: 0 }] };
    }
    const hops: ImpactHop[] = [
      { id: originId, kind: 'origin', label: originId, hop: 0 },
      ...result.records[0].get('hops').filter((h: any) => h?.id).map((h: any) => ({
        id: h.id,
        kind: Array.isArray(h.labels) ? String(h.labels[0] || 'Node') : 'Node',
        label: String(h.name || h.id),
        hop: Number(h.hop) || 1,
      })),
    ];
    return { originId, hops };
  }

  private async logDecision(action: string, actor: string, aId: string, bId: string) {
    const id = randomUUID();
    const at = new Date().toISOString();
    await this.neo4j.write(
      `CREATE (d:PatchDecision {id: $id, action: $action, actor: $actor, at: $at, aId: $aId, bId: $bId})`,
      { id, action, actor, at, aId, bId },
    );
  }

  private emptyReport(rackId: string, source: string): DiscoveryReport {
    return { rackId, source, portsCreated: 0, linksCreated: 0, links: [], conflicts: [] };
  }

  private applyAttempt(report: DiscoveryReport, attempt: LinkAttempt) {
    if (attempt.kind === 'conflict') report.conflicts.push(attempt.conflict);
    else {
      if (attempt.kind === 'created') report.linksCreated += 1;
      report.links.push(attempt.link);
    }
  }

  private async portById(id: string): Promise<Port | null> {
    const r = await this.neo4j.read(`MATCH (p:Port {id: $id}) RETURN p`, { id });
    return r.records[0] ? this.mapPort(r.records[0].get('p').properties) : null;
  }

  private async peerOf(portId: string): Promise<{ port: Port; via: string } | null> {
    const r = await this.neo4j.read(
      `MATCH (a:Port {id: $portId})-[p:PATCHED_TO]-(b:Port) RETURN b, p.via AS via LIMIT 1`,
      { portId },
    );
    if (!r.records.length) return null;
    return { port: this.mapPort(r.records[0].get('b').properties), via: r.records[0].get('via') || 'patch' };
  }

  private async attemptLink(a: Port, b: Port, via: string): Promise<LinkAttempt> {
    const same = await this.neo4j.read(
      `MATCH (x:Port {id: $a})-[p:PATCHED_TO]-(y:Port {id: $b}) RETURN p`,
      { a: a.id, b: b.id },
    );
    if (same.records.length) {
      return { kind: 'exists', link: { id: same.records[0].get('p').properties?.id || `${a.id}-${b.id}`, via, a, b } };
    }
    const peerA = await this.peerOf(a.id);
    const peerB = await this.peerOf(b.id);
    if (peerA && peerA.port.id !== b.id) {
      return {
        kind: 'conflict',
        conflict: {
          reason: `${a.deviceId}:${a.name} déjà brassé vers ${peerA.port.deviceId}:${peerA.port.name}`,
          wantedA: a, wantedB: b, existingPeer: peerA.port, existingVia: peerA.via,
        },
      };
    }
    if (peerB && peerB.port.id !== a.id) {
      return {
        kind: 'conflict',
        conflict: {
          reason: `${b.deviceId}:${b.name} déjà brassé vers ${peerB.port.deviceId}:${peerB.port.name}`,
          wantedA: a, wantedB: b, existingPeer: peerB.port, existingVia: peerB.via,
        },
      };
    }
    const id = randomUUID();
    await this.neo4j.write(
      `MATCH (x:Port {id: $a}), (y:Port {id: $b}) CREATE (x)-[p:PATCHED_TO {id: $id, via: $via, at: datetime()}]->(y)`,
      { a: a.id, b: b.id, id, via },
    );
    return { kind: 'created', link: { id, via, a, b } };
  }

  private async resolveDevice(rackId: string, key: string): Promise<string | null> {
    const r = await this.neo4j.read(
      `MATCH (d:Device)-[:INSTALLED_IN]->(:Rack {id: $rackId}) WHERE d.id = $key OR d.name = $key RETURN d.id AS id LIMIT 1`,
      { rackId, key },
    );
    return r.records[0]?.get('id') || null;
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
}
