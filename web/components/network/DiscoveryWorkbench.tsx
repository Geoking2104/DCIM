'use client';
import { gql, useMutation, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { DISCOVERY_TOOLS } from '@/lib/discoveryTools';

const RACKS = gql`query DiscoRacks { racks { id name } }`;
const REPORT_FIELDS = `
  rackId source portsCreated linksCreated
  links { id via a { id name deviceId } b { id name deviceId } }
  conflicts { reason existingVia wantedA { id name deviceId } wantedB { id name deviceId } existingPeer { name deviceId } }
`;
const DISCOVER = gql`mutation DiscoverNetwork($input: DiscoverNetworkInput!) { discoverNetwork(input: $input) { ${REPORT_FIELDS} } }`;
const IMPORT = gql`mutation ImportPatches($input: ImportPatchesInput!) { importPatches(input: $input) { ${REPORT_FIELDS} } }`;
const RESOLVE = gql`
  mutation ResolvePatch($input: ResolvePatchConflictInput!) {
    resolvePatchConflict(input: $input) {
      linksCreated
      conflicts { reason }
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
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [run, { data: out, loading, error }] = useMutation(DISCOVER);
  const [imp, { data: imported, loading: importing, error: importErr }] = useMutation(IMPORT);
  const [resolve, { loading: resolving, error: resolveErr }] = useMutation(RESOLVE);
  const spec = DISCOVERY_TOOLS.find((t) => t.id === tool)!;
  const report = imported?.importPatches || out?.discoverNetwork;
  const conflicts = useMemo(
    () => (report?.conflicts || []).filter((c: any) => !dismissed.includes(`${c.wantedA?.id}-${c.wantedB?.id}`)),
    [report, dismissed]
  );

  function parseCsv(text: string) {
    return text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l && !l.toLowerCase().startsWith('adevice'))
      .map((l) => {
        const [aDevice, aPort, bDevice, bPort] = l.split(',').map((s) => s.trim());
        return { aDevice, aPort, bDevice, bPort };
      })
      .filter((r) => r.aDevice && r.aPort && r.bDevice && r.bPort);
  }

  async function decide(c: any, action: 'keep' | 'replace') {
    if (!c.wantedA?.id || !c.wantedB?.id) return;
    await resolve({ variables: { input: { wantedAId: c.wantedA.id, wantedBId: c.wantedB.id, action } } });
    setDismissed((d) => [...d, `${c.wantedA.id}-${c.wantedB.id}`]);
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      <div>
        <a href={`/${locale}/outils`} className="text-[12px] text-[#0176D3]">← Outils</a>
        <h1 className="text-[28px] font-extrabold mt-2">Outils de découverte réseau</h1>
        <p className="text-[13px] text-[#444]">Conflit : conserver le brassage actuel ou le remplacer (rôle admin).</p>
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
            <button type="button" disabled={!rackId || loading} onClick={() => { setDismissed([]); run({ variables: { input: { rackId, source: spec.source } } }); }} className="px-4 py-2 rounded bg-[#032D60] text-white text-[13px] disabled:opacity-40">
              {loading ? 'Collecte…' : `Exécuter ${spec.title}`}
            </button>
          )}
        </div>
        {tool === 'csv' && (
          <div className="space-y-2">
            <textarea className="w-full border rounded p-2 font-mono text-[12px] h-32" value={csv} onChange={(e) => setCsv(e.target.value)} />
            <button type="button" disabled={!rackId || importing} onClick={() => { setDismissed([]); imp({ variables: { input: { rackId, rows: parseCsv(csv) } } }); }} className="px-4 py-2 rounded bg-[#0176D3] text-white text-[13px] disabled:opacity-40">
              {importing ? 'Import…' : 'Importer le brassage'}
            </button>
          </div>
        )}
        {(error || importErr || resolveErr) && <p className="text-[13px] text-[#C23934]">{(error || importErr || resolveErr)?.message}</p>}
        {report && <p className="text-[13px]">{report.source} · +{report.linksCreated} liens · {conflicts.length} conflits ouverts</p>}
        {conflicts.length > 0 && (
          <ul className="text-[13px] space-y-3 bg-[#FFF0F0] border border-[#E5C1C1] rounded p-3">
            {conflicts.map((c: any, i: number) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 items-start">
                <div>
                  {c.reason}
                  {c.existingPeer && <div className="text-[#706E6B]">actuel {c.existingPeer.deviceId}:{c.existingPeer.name} ({c.existingVia})</div>}
                </div>
                <div className="flex gap-2">
                  <button type="button" disabled={resolving || !c.wantedA?.id} onClick={() => decide(c, 'keep')} className="px-2 py-1 border rounded bg-white">Conserver</button>
                  <button type="button" disabled={resolving || !c.wantedA?.id} onClick={() => decide(c, 'replace')} className="px-2 py-1 rounded bg-[#BA0517] text-white">Remplacer</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
