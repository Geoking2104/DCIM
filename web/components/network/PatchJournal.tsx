'use client';
import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';

const DECISIONS = gql`
  query PatchJournal {
    patchDecisions { id action actor at aId bId }
  }
`;

type Period = 'all' | '24h' | '7d' | '30d';

function since(period: Period) {
  if (period === 'all') return 0;
  const h = period === '24h' ? 24 : period === '7d' ? 24 * 7 : 24 * 30;
  return Date.now() - h * 3600_000;
}

export default function PatchJournal({ locale }: { locale: string }) {
  const { data, loading, error, refetch } = useQuery(DECISIONS, {
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    ssr: false
  });
  const [filter, setFilter] = useState<'all' | 'keep' | 'replace'>('all');
  const [period, setPeriod] = useState<Period>('all');
  const [actor, setActor] = useState('all');
  const [q, setQ] = useState('');
  const rows = data?.patchDecisions || [];
  const windowed = useMemo(() => {
    const t = since(period);
    return t ? rows.filter((r: any) => new Date(r.at).getTime() >= t) : rows;
  }, [rows, period]);
  const keep = windowed.filter((r: any) => r.action === 'keep').length;
  const replace = windowed.filter((r: any) => r.action === 'replace').length;
  const total = windowed.length || 1;
  const actors = useMemo(() => {
    const map = new Map<string, { keep: number; replace: number }>();
    windowed.forEach((r: any) => {
      const cur = map.get(r.actor) || { keep: 0, replace: 0 };
      if (r.action === 'replace') cur.replace += 1;
      else cur.keep += 1;
      map.set(r.actor, cur);
    });
    return [...map.entries()].sort((a, b) => b[1].keep + b[1].replace - (a[1].keep + a[1].replace));
  }, [windowed]);
  const visible = useMemo(() => {
    return windowed.filter((r: any) => {
      if (filter !== 'all' && r.action !== filter) return false;
      if (actor !== 'all' && r.actor !== actor) return false;
      if (!q) return true;
      return `${r.actor} ${r.aId} ${r.bId} ${r.action}`.toLowerCase().includes(q.toLowerCase());
    });
  }, [windowed, filter, actor, q]);

  function exportCsv() {
    const header = 'at,action,actor,aId,bId';
    const body = visible.map((r: any) => [r.at, r.action, r.actor, r.aId, r.bId].join(',')).join('\n');
    const blob = new Blob([`${header}\n${body}\n`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal-brassage.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-[960px] mx-auto px-6 py-8 space-y-8">
      <div className="flex justify-between gap-3 flex-wrap">
        <div>
          <a href={`/${locale}/outils/decouverte`} className="text-[12px] text-[#0176D3]">← Découverte</a>
          <h1 className="text-[28px] font-extrabold mt-1">Journal des brassages</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => refetch()} className="px-3 py-2 border rounded text-[13px] bg-white">Rafraîchir</button>
          <button type="button" onClick={exportCsv} disabled={!visible.length} className="px-3 py-2 rounded text-[13px] bg-[#032D60] text-white disabled:opacity-40">Exporter CSV</button>
        </div>
      </div>
      {error && <p className="text-[#C23934] text-[13px]">{error.message}</p>}
      {loading && <p className="text-[13px]">Chargement…</p>}
      <div className="flex flex-wrap gap-2">
        {(['all', '24h', '7d', '30d'] as Period[]).map((p) => (
          <button key={p} type="button" onClick={() => setPeriod(p)} className={`px-3 py-1 rounded border text-[12px] ${period === p ? 'bg-[#0176D3] text-white' : 'bg-white'}`}>
            {p === 'all' ? 'Toutes dates' : p}
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Décisions" value={windowed.length} />
        <Stat label="Conservés" value={keep} />
        <Stat label="Remplacés" value={replace} />
      </div>
      <div className="h-3 rounded-full bg-[#F3F3F3] overflow-hidden flex">
        <div className="bg-[#0B7E25] h-3" style={{ width: `${(keep / total) * 100}%` }} />
        <div className="bg-[#BA0517] h-3" style={{ width: `${(replace / total) * 100}%` }} />
      </div>
      {actors.length > 0 && (
        <div className="slds-card p-4 bg-white space-y-2">
          <div className="text-[11px] uppercase font-bold text-[#706E6B]">Par acteur</div>
          {actors.map(([name, c]) => {
            const n = c.keep + c.replace || 1;
            return (
              <button key={name} type="button" onClick={() => setActor(actor === name ? 'all' : name)} className="w-full text-left">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className={actor === name ? 'font-bold' : ''}>{name}</span>
                  <span className="text-[#706E6B]">{c.keep} keep · {c.replace} replace</span>
                </div>
                <div className="h-1.5 bg-[#F3F3F3] rounded overflow-hidden flex">
                  <div className="bg-[#0B7E25]" style={{ width: `${(c.keep / n) * 100}%` }} />
                  <div className="bg-[#BA0517]" style={{ width: `${(c.replace / n) * 100}%` }} />
                </div>
              </button>
            );
          })}
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        {(['all', 'keep', 'replace'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={`px-3 py-1 rounded border text-[12px] ${filter === f ? 'bg-[#032D60] text-white' : 'bg-white'}`}>
            {f === 'all' ? 'Tout' : f}
          </button>
        ))}
        <input className="border rounded px-3 py-1 text-[13px] ml-auto" placeholder="acteur ou port…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ol className="relative border-l border-[#D8D8D8] ml-3 space-y-5">
        {visible.length === 0 && <p className="pl-6 text-[13px] text-[#706E6B]">Rien à afficher.</p>}
        {visible.map((d: any) => (
          <li key={d.id} className="pl-6">
            <span className={`absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full ${d.action === 'replace' ? 'bg-[#BA0517]' : 'bg-[#0B7E25]'}`} />
            <div className="text-[11px] uppercase text-[#706E6B]">{d.at?.replace('T', ' ').slice(0, 19)}</div>
            <div className="text-[15px] font-bold">{d.action === 'replace' ? 'Remplacement' : 'Conservation'}</div>
            <div className="text-[13px] text-[#444]">{d.actor}</div>
            <div className="text-[12px] font-mono text-[#706E6B]">{d.aId} ↔ {d.bId}</div>
            <a className="text-[12px] text-[#0176D3]" href={`/${locale}/graphe-reseau`}>Voir le graphe</a>
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
