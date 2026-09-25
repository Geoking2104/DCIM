'use client';

import { useMemo, useState } from 'react';
import { pue, wue, pueBand, wueBand } from '@/lib/energyCalcs';

type Kind = 'pue' | 'wue';

export default function EnergyCalculator({ kind, locale }: { kind: Kind; locale: string }) {
  const [total, setTotal] = useState('');
  const [it, setIt] = useState('');
  const [water, setWater] = useState('');
  const [showForm, setShowForm] = useState(false);

  const result = useMemo(() => {
    const itN = Number(it);
    if (kind === 'pue') {
      const t = Number(total);
      if (!t || !itN) return null;
      return pue(t, itN);
    }
    const w = Number(water);
    if (w === 0 && water === '') return null;
    if (!itN) return null;
    return wue(Number(water), itN);
  }, [kind, total, it, water]);

  const band = result && 'value' in result && result.value
    ? kind === 'pue'
      ? pueBand(result.value)
      : wueBand(result.value)
    : null;

  const mailto = useMemo(() => {
    const score = result && 'value' in result ? result.value.toFixed(3) : '?';
    const subject = kind === 'pue' ? `Calcul électricité ${score}` : `Calcul eau ${score}`;
    const body = [
      kind === 'pue' ? `Efficacité électrique (PUE) : ${score}` : `Efficacité eau (WUE) : ${score} L/kWh`,
      kind === 'pue' ? `Salle : ${total} kWh · Machines : ${it} kWh` : `Eau : ${water} L · Machines : ${it} kWh`,
      band ? `Lecture : ${band.label}` : '',
      '',
      'Chiffre indicatif — pas un tampon officiel.'
    ].join('\n');
    return `mailto:contact@qinode.eu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }, [kind, result, total, it, water, band]);

  return (
    <div className="max-w-[640px] mx-auto">
      <div className="border rounded-2xl bg-white p-6 md:p-8 space-y-4">
        {kind === 'pue' ? (
          <>
            <label className="block text-[13px] font-semibold">
              Électricité de toute la salle
              <input type="number" min="0" step="1" value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" placeholder="kWh sur la période" />
            </label>
            <p className="text-[12px] text-slate-500">Compteur du bâtiment : machines + froid + onduleurs + éclairage.</p>
          </>
        ) : (
          <>
            <label className="block text-[13px] font-semibold">
              Eau consommée par la salle
              <input type="number" min="0" step="1" value={water} onChange={(e) => setWater(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" placeholder="Litres sur la période" />
            </label>
            <p className="text-[12px] text-slate-500">Appoint, humidification, tours — la même période que l’électricité des machines.</p>
          </>
        )}
        <label className="block text-[13px] font-semibold">
          Électricité des machines seulement
          <input type="number" min="0" step="1" value={it} onChange={(e) => setIt(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" placeholder="kWh serveurs, stockage, réseau" />
        </label>
        {result && 'error' in result && <p className="text-[13px] text-red-600">{result.error}</p>}
        {result && 'value' in result && (
          <div className="rounded-xl bg-[#F8FAFC] border p-5">
            <div className="text-[12px] uppercase tracking-widest font-bold text-[#0176D3]">{kind === 'pue' ? 'PUE' : 'WUE'}</div>
            <div className="text-[40px] font-black leading-none mt-1">
              {result.value.toFixed(3)}
              <span className="text-[16px] font-semibold text-slate-500 ml-2">{kind === 'wue' ? 'L / kWh' : ''}</span>
            </div>
            {band && (
              <>
                <div className={`mt-3 text-[14px] font-bold ${band.tone === 'good' ? 'text-emerald-700' : band.tone === 'mid' ? 'text-amber-700' : 'text-orange-700'}`}>{band.label}</div>
                <p className="mt-1 text-[13px] text-slate-600">{band.hint}</p>
              </>
            )}
            <p className="mt-3 text-[11px] text-slate-400">Aperçu. Le dossier officiel se relit à deux — Qinode ne pose pas le tampon.</p>
          </div>
        )}
        {result && 'value' in result && (
          <div className="flex flex-wrap gap-3">
            <a href={mailto} className="bg-[#0176D3] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">
              {kind === 'pue' ? 'Je veux baisser ce chiffre' : 'Je veux suivre l’eau'}
            </a>
            <a href={`/${locale}/eed`} className="border px-5 py-2.5 rounded-full text-[13px] font-semibold">Dossier européen</a>
            <button type="button" className="text-[13px] text-slate-500" onClick={() => setShowForm((s) => !s)}>
              {showForm ? 'Fermer le message' : 'Préparer un message'}
            </button>
          </div>
        )}
        {showForm && (
          <p className="text-[13px] text-slate-600">
            Le lien ouvre votre messagerie avec le résultat. Pour un suivi compteur → prise :{' '}
            <a className="text-[#0176D3] font-semibold" href={`/${locale}/power`}>module prises</a>.
          </p>
        )}
      </div>
    </div>
  );
}
