'use client';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

const RACKS = gql`query GRacks { racks { id name devices { id name } } }`;
const LINKS = gql`
  query GLinks($rackId: ID!) {
    networkLinks(rackId: $rackId) {
      id via
      a { id name speed deviceId }
      b { id name speed deviceId }
    }
  }
`;

type PortN = { id: string; name: string; speed?: string; deviceId?: string };
type LinkN = { id: string; via: string; a: PortN; b: PortN };

const DEMO: LinkN[] = [
  { id: '1', via: 'lldp-sim', a: { id: 'p1', name: 'Eth1/2', deviceId: 'tor-c05', speed: '25G' }, b: { id: 'p2', name: 'nic0', deviceId: 'srv-gpu-12', speed: '25G' } },
  { id: '2', via: 'lldp-sim', a: { id: 'p3', name: 'Eth1/3', deviceId: 'tor-c05', speed: '25G' }, b: { id: 'p4', name: 'nic0', deviceId: 'sto-nvme-03', speed: '25G' } },
  { id: '3', via: 'csv-patch', a: { id: 'p5', name: 'Eth1/48', deviceId: 'tor-c05', speed: '100G' }, b: { id: 'p6', name: 'uplink', deviceId: 'spine-01', speed: '100G' } }
];

export default function NetworkGraph({ locale }: { locale: string }) {
  const { data: racksData } = useQuery(RACKS, { errorPolicy: 'all', ssr: false });
  const racks = racksData?.racks || [];
  const [rackId, setRackId] = useState('');
  const [load, { data, loading }] = useLazyQuery(LINKS, { fetchPolicy: 'no-cache' });
  const [hover, setHover] = useState<string>();
  const live = Boolean(data?.networkLinks);
  const links: LinkN[] = live ? data.networkLinks : DEMO;

  const layout = useMemo(() => layoutGraph(links), [links]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wide text-[#706E6B]">Graphe</p>
          <h1 className="text-[28px] font-extrabold">Topologie réseau</h1>
          <p className="text-[13px] text-[#444] max-w-[60ch]">
            Nœuds = ports. Arêtes = <code>PATCHED_TO</code>. Données GraphQL ou démo si le rack est vide.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <select className="border rounded px-3 py-2 text-[13px]" value={rackId} onChange={(e) => setRackId(e.target.value)}>
            <option value="">Rack…</option>
            {racks.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button type="button" className="px-3 py-2 rounded bg-[#032D60] text-white text-[13px]" disabled={!rackId || loading} onClick={() => load({ variables: { rackId } })}>
            {loading ? '…' : 'Charger'}
          </button>
          <a className="text-[13px] underline" href={`/${locale}/outils/decouverte`}>Découverte</a>
        </div>
      </div>

      <div className="rounded-xl border bg-[#071422] overflow-hidden">
        <svg viewBox="0 0 960 520" className="w-full h-auto">
          {layout.edges.map((e) => (
            <g key={e.id}>
              <line
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={hover === e.id ? '#5CE1E6' : '#3D5A80'}
                strokeWidth={hover === e.id ? 3 : 1.5}
                onMouseEnter={() => setHover(e.id)}
                onMouseLeave={() => setHover(undefined)}
              />
              <text x={(e.x1 + e.x2) / 2} y={(e.y1 + e.y2) / 2 - 6} fill="#8BA3C7" fontSize="10" textAnchor="middle">{e.via}</text>
            </g>
          ))}
          {layout.nodes.map((n) => (
            <g key={n.id} transform={`translate(${n.x},${n.y})`}>
              <circle r={n.kind === 'device' ? 22 : 10} fill={n.kind === 'device' ? '#0176D3' : '#0B7E25'} stroke="#fff" strokeWidth="1" />
              <text y={n.kind === 'device' ? 36 : 22} fill="#E8F1FF" fontSize={n.kind === 'device' ? 11 : 9} textAnchor="middle">
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <p className="text-[12px] text-[#706E6B]">
        {live ? `${links.length} liens GraphQL` : 'Jeu démo — lancez une découverte puis rechargez un rack.'}
        {' · '}cercle bleu = équipement · vert = port
      </p>
    </div>
  );
}

function layoutGraph(links: LinkN[]) {
  const devices = new Map<string, { x: number; y: number }>();
  const ports: { id: string; label: string; kind: 'port' | 'device'; x: number; y: number }[] = [];
  const deviceIds = Array.from(new Set(links.flatMap((l) => [l.a.deviceId || l.a.id, l.b.deviceId || l.b.id])));
  deviceIds.forEach((id, i) => {
    const x = 140 + (i % 4) * 220;
    const y = 90 + Math.floor(i / 4) * 200;
    devices.set(id, { x, y });
    ports.push({ id: `dev-${id}`, label: id, kind: 'device', x, y });
  });
  const portPos = new Map<string, { x: number; y: number }>();
  const seen = new Set<string>();
  links.forEach((l) => {
    [l.a, l.b].forEach((p, idx) => {
      if (seen.has(p.id)) return;
      seen.add(p.id);
      const parent = devices.get(p.deviceId || p.id) || { x: 480, y: 260 };
      const x = parent.x + (idx === 0 ? -50 : 50);
      const y = parent.y + 55;
      portPos.set(p.id, { x, y });
      ports.push({ id: p.id, label: p.name, kind: 'port', x, y });
    });
  });
  const edges = links.map((l) => {
    const a = portPos.get(l.a.id) || { x: 100, y: 100 };
    const b = portPos.get(l.b.id) || { x: 200, y: 200 };
    return { id: l.id, via: l.via, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });
  return { nodes: ports, edges };
}
