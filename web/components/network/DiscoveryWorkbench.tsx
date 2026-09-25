'use client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { DISCOVERY_TOOLS } from '@/lib/discoveryTools';

const RACKS = gql`query DiscoRacks { racks { id name } }`;
const DISCOVER = gql`
  mutation DiscoverNetwork($input: DiscoverNetworkInput!) {
    discoverNetwork(input: $input) {
      rackId source portsCreated linksCreated
      links { id via a { name deviceId speed } b { name deviceId speed } }
    }
  }
`;

export default function DiscoveryWorkbench({ locale }: { locale: string }) {
  const { data } = useQuery(RACKS, { errorPolicy: 'all', ssr: false });
  const racks = data?.racks || [];
  const [rackId, setRackId] = useState('');
  const [tool, setTool] = useState<(typeof DISCOVERY_TOOLS)[number]['id']>('lldp');
  const [run, { data: out, loading, error }] = useMutation(DISCOVER);
  const spec = DISCOVERY_TOOLS.find((t) => t.id === tool)!;
  const report = out?.discoverNetwork;

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      <div>
        <a href={`/${locale}/outils`} className="text-[12px] text-[#0176D3]">← Outils</a>
        <h1 className="text-[28px] font-extrabold mt-2">Outils de découverte réseau</h1>
        <p className="text-[14px] text-[#444] max-w-[68ch]">
          Quatre collecteurs, une seule mutation <code>discoverNetwork</code>. Le graphe reste la source de vérité : on ajoute, on ne remplace pas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {DISCOVERY_TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTool(t.id)}
            className={`text-left rounded-2xl border p-5 bg-white ${
              tool === t.id ? 'border-[#0176D3] ring-1 ring-[#0176D3]' : ''
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">{t.kicker}</div>
            <h2 className="mt-1 text-[18px] font-extrabold">{t.title}</h2>
            <p className="mt-2 text-[13px] text-[#444]">{t.lead}</p>
            <p className="mt-3 text-[12px] text-[#706E6B]">{t.needs}</p>
          </button>
        ))}
      </div>

      <div className="slds-card p-5 bg-white space-y-4">
        <div className="text-[13px]"><b>Source écrite dans le graphe :</b> <code>{spec.source}</code></div>
        <p className="text-[12px] text-[#706E6B]">{spec.risk}</p>
        <div className="flex flex-wrap gap-3">
          <select
            className="border rounded px-3 py-2 text-[13px]"
            value={rackId}
            onChange={(e) => setRackId(e.target.value)}
          >
            <option value="">Choisir un rack</option>
            {racks.map((r: any) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!rackId || loading}
            onClick={() => run({ variables: { input: { rackId, source: spec.source } } })}
            className="px-4 py-2 rounded bg-[#032D60] text-white text-[13px] disabled:opacity-40"
          >
            {loading ? 'Collecte…' : `Exécuter ${spec.title}`}
          </button>
          <a href={`/${locale}/inventaire-reseau`} className="px-4 py-2 rounded border text-[13px]">Voir l’inventaire</a>
        </div>
        {error && <p className="text-[13px] text-[#C23934]">{error.message}</p>}
        {report && (
          <p className="text-[13px]">
            {report.source} · +{report.portsCreated} ports · +{report.linksCreated} liens sur {report.rackId}
          </p>
        )}
        {report?.links?.length > 0 && (
          <ul className="text-[13px] font-mono space-y-1">
            {report.links.map((l: any) => (
              <li key={l.id}>{l.a.deviceId}:{l.a.name} ↔ {l.b.deviceId}:{l.b.name} <span className="text-[#706E6B]">({l.via})</span></li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
