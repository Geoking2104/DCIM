'use client';
import { useEffect, useMemo, useState } from 'react';
import { gql, useQuery, useSubscription } from '@apollo/client';
import { TOPOLOGY_LIFECYCLE } from '@/lib/topologySubscriptions';
import GraphQLStatus from '@/components/GraphQLStatus';
import { classifyGraphQLError } from '@/lib/graphqlErrors';
import { GRAPHQL_URL } from '@/lib/graphql';
import { readLastRack, writeLastRack } from '@/lib/lastRack';
import RackElevation, { TopoRack } from './RackElevation';

const RACKS = gql`
  query TopologyRacks {
    racks { id name heightU siteId devices { id name model startU heightU } }
  }
`;

const DEMO: TopoRack[] = [
  {
    id: 'demo-05',
    name: 'RACK-05 · Allée C',
    heightU: 42,
    siteId: 'PAR-1',
    devices: [
      { id: 'pdu-a', name: 'PDU A', model: 'APC', startU: 1, heightU: 1 },
      { id: 'sw-1', name: 'ToR-SW-01', model: 'N9K', startU: 39, heightU: 2 },
      { id: 'srv-1', name: 'SRV-GPU-12', model: 'R760', startU: 18, heightU: 4 },
      { id: 'srv-2', name: 'SRV-CPU-04', model: 'R660', startU: 10, heightU: 2 }
    ]
  },
  {
    id: 'demo-01',
    name: 'RACK-01 · Allée A',
    heightU: 42,
    siteId: 'PAR-1',
    devices: [
      { id: 'ups', name: 'UPS shelf', startU: 1, heightU: 3 },
      { id: 'sto', name: 'SAN-01', startU: 20, heightU: 4 }
    ]
  }
];

export default function TopologyView() {
  const [selRack, setSelRack] = useState<string>();
  const [selDev, setSelDev] = useState<string>();
  const [lastEvent, setLastEvent] = useState<string>();
  const { data, error, loading, refetch } = useQuery(RACKS, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    ssr: false
  });
  useSubscription(TOPOLOGY_LIFECYCLE, {
    onData: ({ data: sub }) => {
      const ev = sub.data?.topologyLifecycle;
      if (ev?.kind) setLastEvent(ev.kind);
      void refetch();
    }
  });

  const live = Boolean(data?.racks?.length);
  const racks: TopoRack[] = live ? data.racks : DEMO;

  useEffect(() => {
    const saved = readLastRack();
    if (saved && racks.some((r) => r.id === saved)) setSelRack(saved);
  }, [racks]);

  const current = racks.find((r) => r.id === selRack) || racks[0];
  const selected = current?.devices?.find((d) => d.id === selDev);
  const classified = useMemo(
    () => (error ? classifyGraphQLError(error, GRAPHQL_URL) : null),
    [error]
  );

  const used = current?.devices?.reduce((s, d) => s + d.heightU, 0) || 0;
  const hu = current?.heightU || 42;

  function pickRack(id: string) {
    setSelRack(id);
    setSelDev(undefined);
    writeLastRack(id);
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-[#706E6B] font-bold">Topologie</p>
          <h1 className="text-[28px] font-extrabold">Élévation rack · U par U</h1>
          <p className="text-[13px] text-[#444] max-w-[62ch]">
            Vue issue du graphe GraphQL. Un clic sur un U sélectionne l’appareil. Les mutations
            publient <code>topologyLifecycle</code> et rafraîchissent la scène.
          </p>
        </div>
        <GraphQLStatus error={classified} loading={loading} live={live} lastEvent={lastEvent} />
      </div>

      <div className="flex flex-wrap gap-2">
        {racks.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => pickRack(r.id)}
            className={`px-3 py-1.5 rounded border text-[12px] ${
              current?.id === r.id ? 'bg-[#032D60] text-white border-[#032D60]' : 'bg-white'
            }`}
          >
            {r.name}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[280px_1fr_260px] gap-6 items-start">
        <RackElevation rack={current} selectedId={selDev} onSelect={setSelDev} />
        <div className="slds-card p-5 bg-white min-h-[320px]">
          <div className="text-[11px] uppercase font-bold text-[#706E6B]">Occupation</div>
          <div className="mt-2 text-[22px] font-black">{used} / {hu} U</div>
          <div className="h-2 bg-[#F3F3F3] rounded mt-2">
            <div className="h-2 bg-[#0176D3] rounded" style={{ width: `${Math.min(100, (used / hu) * 100)}%` }} />
          </div>
          <ul className="mt-4 space-y-2 text-[13px]">
            {(current?.devices || []).sort((a, b) => b.startU - a.startU).map((d) => (
              <li key={d.id}>
                <button type="button" className="text-left w-full hover:text-[#0176D3]" onClick={() => setSelDev(d.id)}>
                  <span className="font-mono text-[11px] text-[#706E6B]">U{d.startU}–{d.startU + d.heightU - 1}</span>{' '}
                  <span className="font-semibold">{d.name}</span>
                  <span className="text-[#706E6B]"> · {d.model}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <aside className="slds-card p-5 bg-[#032D60] text-white text-[13px]">
          <div className="text-[11px] uppercase opacity-70">Sélection</div>
          {selected ? (
            <>
              <h2 className="text-[18px] font-bold mt-1">{selected.name}</h2>
              <p className="opacity-80">{selected.model}</p>
              <p className="mt-3 font-mono text-[12px]">U {selected.startU} → {selected.startU + selected.heightU - 1}</p>
              <p className="opacity-60 text-[11px] mt-4">id {selected.id}</p>
            </>
          ) : (
            <p className="mt-2 opacity-80">Cliquez un équipement dans l’élévation.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
