'use client';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';

const RACKS = gql`query NetRacks { racks { id name } }`;
const LINKS = gql`
  query NetworkLinks($rackId: ID!) {
    networkLinks(rackId: $rackId) {
      id via
      a { id name speed deviceId }
      b { id name speed deviceId }
    }
  }
`;
const DISCOVER = gql`
  mutation DiscoverNetwork($input: DiscoverNetworkInput!) {
    discoverNetwork(input: $input) {
      rackId source portsCreated linksCreated
      links { id via a { name deviceId } b { name deviceId } }
    }
  }
`;

export default function NetworkInventory() {
  const { data: racksData } = useQuery(RACKS, { errorPolicy: 'all', ssr: false });
  const racks = racksData?.racks || [{ id: 'demo', name: 'RACK-05 (démo)' }];
  const [rackId, setRackId] = useState<string>(racks[0]?.id);
  const [loadLinks, { data, loading }] = useLazyQuery(LINKS, { fetchPolicy: 'no-cache' });
  const [discover, { data: report, loading: running }] = useMutation(DISCOVER);

  const links = report?.discoverNetwork?.links || data?.networkLinks || [];

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
      <div>
        <p className="text-[11px] uppercase tracking-wide font-bold text-[#706E6B]">Connectivités</p>
        <h1 className="text-[28px] font-extrabold">Inventaire réseau automatisé</h1>
        <p className="text-[13px] text-[#444] max-w-[68ch]">
          Découverte agentless réconciliée avec le graphe : ports ToR ↔ NIC, lien
          <code className="mx-1">PATCHED_TO</code> étiqueté LLDP. Idempotent — relancer n’écrase pas l’inventaire gouverné.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded px-3 py-2 text-[13px] bg-white"
          value={rackId}
          onChange={(e) => setRackId(e.target.value)}
        >
          {racks.map((r: any) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <button
          type="button"
          disabled={running || !rackId || rackId === 'demo'}
          onClick={() => discover({ variables: { input: { rackId, source: 'lldp-sim' } } })}
          className="px-4 py-2 rounded bg-[#0176D3] text-white text-[13px] disabled:opacity-40"
        >
          {running ? 'Découverte…' : 'Lancer la découverte'}
        </button>
        <button
          type="button"
          disabled={!rackId || rackId === 'demo'}
          onClick={() => loadLinks({ variables: { rackId } })}
          className="px-4 py-2 rounded border text-[13px] bg-white"
        >
          {loading ? 'Lecture…' : 'Lire les liens'}
        </button>
      </div>

      {report?.discoverNetwork && (
        <div className="slds-card p-4 text-[13px]">
          Source <b>{report.discoverNetwork.source}</b> · ports +{report.discoverNetwork.portsCreated} · liens +{report.discoverNetwork.linksCreated}
        </div>
      )}

      <div className="slds-card overflow-hidden">
        <table className="w-full text-[13px]">
          <thead className="bg-[#FAFAF9] text-[11px] uppercase">
            <tr>
              <th className="p-2.5 text-left">Via</th>
              <th className="p-2.5 text-left">Port A</th>
              <th className="p-2.5 text-left">Port B</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {links.length === 0 && (
              <tr><td className="p-4 text-[#706E6B]" colSpan={3}>Aucun lien — lancez une découverte sur un rack GraphQL.</td></tr>
            )}
            {links.map((l: any) => (
              <tr key={l.id}>
                <td className="p-2.5 font-mono text-[12px]">{l.via}</td>
                <td className="p-2.5">{l.a?.deviceId} · {l.a?.name} <span className="text-[#706E6B]">{l.a?.speed}</span></td>
                <td className="p-2.5">{l.b?.deviceId} · {l.b?.name} <span className="text-[#706E6B]">{l.b?.speed}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
