'use client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import { DISCOVERY_TOOLS } from '@/lib/discoveryTools';

const RACKS = gql`query DiscoRacks { racks { id name } }`;
const DISCOVER = gql`
  mutation DiscoverNetwork($input: DiscoverNetworkInput!) {
    discoverNetwork(input: $input) {
      rackId source portsCreated linksCreated
      links { id via a { name deviceId } b { name deviceId } }
      conflicts { reason existingVia wantedA { name deviceId } wantedB { name deviceId } existingPeer { name deviceId } }
    }
  }
`;
const IMPORT = gql`
  mutation ImportPatches($input: ImportPatchesInput!) {
    importPatches(input: $input) {
      rackId source portsCreated linksCreated
      links { id via a { name deviceId } b { name deviceId } }
      conflicts { reason existingVia wantedA { name deviceId } wantedB { name deviceId } existingPeer { name deviceId } }
    }
  }
`;

const SAMPLE = 'aDevice,aPort,bDevice,bPort\ntor-c05,Eth1/2,srv-gpu-12,nic0\n';

export default function DiscoveryWorkbench({ locale }: { locale: string }) {
  const { data } = useQuery(RACKS, { errorPolicy: 'all', ssr: false });
  const racks = data?.racks || [];
  const [rackId, setRackId] = useState('');
  const [tool, setTool] = useState<(typeof DISCOVERY_TOOLS)[number]['id']>('lldp');
  const [csv, setCsv] = useState(SAMPLE);
  const [run, { data: out, loading, error }] = useMutation(DISCOVER);
  const [imp, { data: imported, loading: importing, error: importErr }] = useMutation(IMPORT);
  const spec = DISCOVERY_TOOLS.find((t) => t.id === tool)!;
  const report = imported?.importPatches || out?.discoverNetwork;

  function parseCsv(text: string) {
    return text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.toLowerCase().startsWith('adevice'))
      .map((l) => {
        const [aDevice, aPort, bDevice, bPort] = l.split(',').map((s) => s.trim());
        return { aDevice, aPort, bDevice, bPort };
      })
      .filter((r) => r.aDevice && r.aPort && r.bDevice && r.bPort);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      <div>
        <a href={`/${locale}/outils`} className="text-[12px] text-[#0176D3]">← Outils</a>
        <h1 className="text-[28px] font-extrabold mt-2">Outils de découverte réseau</h1>
        <p className="text-[13px] text-[#444]">Un port déjà brassé ailleurs = conflit, pas d’écrasement.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {DISCOVERY_TOOLS.map((t) => (
          <button key={t.id} type="button" onClick={() => setTool(t.id)} className={`text-left rounded-2xl border p-5 bg-white ${tool === t.id ? 'border-[#0176D3] ring-1 ring-[#0176D3]' : ''}`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">{t.kicker}</div>
            <h2 className="mt-1 text-[18px] font-extrabold">{t.title}</h2>
            <p className="mt-2 text-[13px] text-[#444]">{t.lead}</p>
          </button>
        ))}
      </div>
      <div className="slds-card p-5 bg-white space-y-4">
        <div className="flex flex-wrap gap-3">
          <select className="border rounded px-3 py-2 text-[13px]" value={rackId} onChange={(e) => setRackId(e.target.value)}>
            <option value="">Choisir un rack</option>
            {racks.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          {tool !== 'csv' && (
            <button type="button" disabled={!rackId || loading} onClick={() => run({ variables: { input: { rackId, source: spec.source } } })} className="px-4 py-2 rounded bg-[#032D60] text-white text-[13px] disabled:opacity-40">
              {loading ? 'Collecte…' : `Exécuter ${spec.title}`}
            </button>
          )}
        </div>
        {tool === 'csv' && (
          <div className="space-y-2">
            <textarea className="w-full border rounded p-2 font-mono text-[12px] h-32" value={csv} onChange={(e) => setCsv(e.target.value)} />
            <button type="button" disabled={!rackId || importing} onClick={() => imp({ variables: { input: { rackId, rows: parseCsv(csv) } } })} className="px-4 py-2 rounded bg-[#0176D3] text-white text-[13px] disabled:opacity-40">
              {importing ? 'Import…' : 'Importer le brassage'}
            </button>
          </div>
        )}
        {(error || importErr) && <p className="text-[13px] text-[#C23934]">{(error || importErr)?.message}</p>}
        {report && (
          <p className="text-[13px]">{report.source} · +{report.linksCreated} liens · {report.conflicts?.length || 0} conflits</p>
        )}
        {report?.conflicts?.length > 0 && (
          <ul className="text-[13px] space-y-1 bg-[#FFF0F0] border border-[#E5C1C1] rounded p-3">
            {report.conflicts.map((c: any, i: number) => (
              <li key={i}>
                {c.reason}
                {c.existingPeer && <span className="text-[#706E6B]"> · actuel {c.existingPeer.deviceId}:{c.existingPeer.name} ({c.existingVia})</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
