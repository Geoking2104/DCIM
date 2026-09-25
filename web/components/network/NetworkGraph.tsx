'use client';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const RACKS = gql`query GRacks { racks { id name } }`;
const LINKS = gql`
  query GLinks($rackId: ID!) {
    networkLinks(rackId: $rackId) {
      id via
      a { id name speed deviceId }
      b { id name speed deviceId }
    }
  }
`;
const IMPACT = gql`
  query Blast($id: ID!) {
    blastRadius(id: $id) { originId hops { id kind label hop } }
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
  const params = useSearchParams();
  const focusA = params.get('a') || undefined;
  const focusB = params.get('b') || undefined;
  const { data: racksData } = useQuery(RACKS, { errorPolicy: 'all', ssr: false });
  const racks = racksData?.racks || [];
  const [rackId, setRackId] = useState('');
  const [isolate, setIsolate] = useState(Boolean(focusA));
  const [origin, setOrigin] = useState<string | undefined>(focusA);
  const [load, { data, loading }] = useLazyQuery(LINKS, { fetchPolicy: 'no-cache' });
  const [impact, { data: impactData }] = useLazyQuery(IMPACT, { fetchPolicy: 'no-cache' });
  const live = Boolean(data?.networkLinks);
  const links: LinkN[] = live ? data.networkLinks : DEMO;
  const focused = useMemo(() => {
    if (!isolate || (!focusA && !focusB)) return links;
    const next = links.filter((l) => [l.a.id, l.b.id].includes(focusA || '') || [l.a.id, l.b.id].includes(focusB || ''));
    return next.length ? next : links;
  }, [links, isolate, focusA, focusB]);
  const layout = useMemo(() => layoutGraph(focused), [focused]);
  const hops = impactData?.blastRadius?.hops || [];
  const hot = new Set<string>([
    ...hops.map((h: any) => h.id),
    ...(focusA ? [focusA] : []),
    ...(focusB ? [focusB] : [])
  ]);

  useEffect(() => {
    if (focusA) void impact({ variables: { id: focusA } });
  }, [focusA, impact]);

  function select(id: string) {
    setOrigin(id);
    void impact({ variables: { id } });
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-5">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase font-bold tracking-wide text-[#706E6B]">Graphe</p>
          <h1 className="text-[28px] font-extrabold">Topologie réseau</h1>
          <p className="text-[13px] text-[#444] max-w-[60ch]">
            {focusA ? `Focus journal · ${focusA.slice(0, 8)}… ↔ ${focusB?.slice(0, 8) || '—'}…` : 'Les nœuds touchés par l’impact passent en ambre.'}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {focusA && (
            <button type="button" onClick={() => setIsolate((v) => !v)} className={`px-3 py-2 rounded border text-[13px] ${isolate ? 'bg-[#CA8501] text-white border-[#CA8501]' : 'bg-white'}`}>
              {isolate ? 'Voisinage' : 'Tout le graphe'}
            </button>
          )}
          <select className="border rounded px-3 py-2 text-[13px]" value={rackId} onChange={(e) => setRackId(e.target.value)}>
            <option value="">Rack…</option>
            {racks.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button type="button" className="px-3 py-2 rounded bg-[#032D60] text-white text-[13px]" disabled={!rackId || loading} onClick={() => load({ variables: { rackId } })}>
            {loading ? '…' : 'Charger'}
          </button>
          <a className="text-[13px] underline" href={`/${locale}/journal-brassage`}>Journal</a>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_240px] gap-4">
        <div className="rounded-xl border bg-[#071422] overflow-hidden">
          <svg viewBox="0 0 960 520" className="w-full h-auto">
            {layout.edges.map((e) => {
              const on = (hot.has(e.aId) && hot.has(e.bId)) || (e.aId === focusA && e.bId === focusB) || (e.aId === focusB && e.bId === focusA);
              return (
                <g key={e.id}>
                  <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={on ? '#F5B942' : '#3D5A80'} strokeWidth={on ? 3 : 1.5} />
                  <text x={(e.x1 + e.x2) / 2} y={(e.y1 + e.y2) / 2 - 6} fill="#8BA3C7" fontSize="10" textAnchor="middle">{e.via}</text>
                </g>
              );
            })}
            {layout.nodes.map((n) => {
              const on = hot.has(n.rawId) || n.rawId === origin;
              return (
                <g key={n.id} transform={`translate(${n.x},${n.y})`} className="cursor-pointer" onClick={() => select(n.rawId)}>
                  <circle r={n.kind === 'device' ? 22 : 10} fill={on ? '#CA8501' : n.kind === 'device' ? '#0176D3' : '#0B7E25'} stroke="#fff" />
                  <text y={n.kind === 'device' ? 36 : 22} fill="#E8F1FF" fontSize={n.kind === 'device' ? 11 : 9} textAnchor="middle">{n.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
        <aside className="slds-card p-4 text-[13px]">
          <div className="text-[11px] uppercase font-bold text-[#706E6B]">Impact {origin ? `· ${origin}` : ''}</div>
          {focusA && <p className="mt-1 text-[12px]">Ports journal : {focusA.slice(0, 8)} / {focusB?.slice(0, 8)}</p>}
          {hops.length === 0 && <p className="mt-2 text-[#706E6B]">Cliquez un nœud.</p>}
          <ol className="mt-2 space-y-1">
            {hops.slice().sort((a: any, b: any) => a.hop - b.hop).map((h: any) => (
              <li key={`${h.id}-${h.hop}`}><span className="font-mono text-[11px] text-[#706E6B]">{h.hop}</span> {h.label} <span className="text-[#706E6B]">{h.kind}</span></li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

function layoutGraph(links: LinkN[]) {
  const devices = new Map<string, { x: number; y: number }>();
  const nodes: { id: string; rawId: string; label: string; kind: 'port' | 'device'; x: number; y: number }[] = [];
  const deviceIds = Array.from(new Set(links.flatMap((l) => [l.a.deviceId || l.a.id, l.b.deviceId || l.b.id])));
  deviceIds.forEach((id, i) => {
    const x = 140 + (i % 4) * 220;
    const y = 90 + Math.floor(i / 4) * 200;
    devices.set(id, { x, y });
    nodes.push({ id: `dev-${id}`, rawId: id, label: id, kind: 'device', x, y });
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
      nodes.push({ id: p.id, rawId: p.id, label: p.name, kind: 'port', x, y });
    });
  });
  const edges = links.map((l) => {
    const a = portPos.get(l.a.id) || { x: 100, y: 100 };
    const b = portPos.get(l.b.id) || { x: 200, y: 200 };
    return { id: l.id, via: l.via, aId: l.a.id, bId: l.b.id, x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });
  return { nodes, edges };
}
