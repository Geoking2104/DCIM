'use client';
import { gql, useQuery } from '@apollo/client';

const DECISIONS = gql`
  query PatchJournal {
    patchDecisions { id action actor at aId bId }
  }
`;

export default function PatchJournal({ locale }: { locale: string }) {
  const { data, loading, error, refetch } = useQuery(DECISIONS, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    ssr: false
  });
  const rows = data?.patchDecisions || [];
  const keep = rows.filter((r: any) => r.action === 'keep').length;
  const replace = rows.filter((r: any) => r.action === 'replace').length;
  const total = rows.length || 1;

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8 space-y-8">
      <div className="flex justify-between gap-3 flex-wrap">
        <div>
          <a href={`/${locale}/outils/decouverte`} className="text-[12px] text-[#0176D3]">← Découverte</a>
          <h1 className="text-[28px] font-extrabold mt-1">Journal des brassages</h1>
          <p className="text-[13px] text-[#444]">Décisions keep / replace issues de <code>PatchDecision</code>.</p>
        </div>
        <button type="button" onClick={() => refetch()} className="px-3 py-2 border rounded text-[13px] bg-white">Rafraîchir</button>
      </div>

      {error && <p className="text-[#C23934] text-[13px]">{error.message}</p>}
      {loading && <p className="text-[13px]">Chargement…</p>}

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Décisions" value={rows.length} />
        <Stat label="Conservés" value={keep} />
        <Stat label="Remplacés" value={replace} />
      </div>

      <div className="h-3 rounded-full bg-[#F3F3F3] overflow-hidden flex">
        <div className="bg-[#0B7E25] h-3" style={{ width: `${(keep / total) * 100}%` }} />
        <div className="bg-[#BA0517] h-3" style={{ width: `${(replace / total) * 100}%` }} />
      </div>
      <p className="text-[11px] text-[#706E6B]"><span className="text-[#0B7E25]">■</span> keep · <span className="text-[#BA0517]">■</span> replace</p>

      <ol className="relative border-l border-[#D8D8D8] ml-3 space-y-5">
        {rows.length === 0 && <p className="pl-6 text-[13px] text-[#706E6B]">Aucune décision pour l’instant.</p>}
        {rows.map((d: any) => (
          <li key={d.id} className="pl-6">
            <span className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full ${d.action === 'replace' ? 'bg-[#BA0517]' : 'bg-[#0B7E25]'}`} />
            <div className="text-[11px] uppercase text-[#706E6B]">{d.at?.replace('T', ' ').slice(0, 19)}</div>
            <div className="text-[15px] font-bold">{d.action === 'replace' ? 'Remplacement' : 'Conservation'}</div>
            <div className="text-[13px] text-[#444]">{d.actor}</div>
            <div className="text-[12px] font-mono text-[#706E6B]">{d.aId} ↔ {d.bId}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="slds-card p-4 bg-white">
      <div className="text-[11px] uppercase text-[#706E6B]">{label}</div>
      <div className="text-[28px] font-black">{value}</div>
    </div>
  );
}
