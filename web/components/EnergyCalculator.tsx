'use client';

import { useState } from 'react';

const LABELS: Record<string, string> = {
  tres_efficace: 'Tres efficace',
  bon: 'Bon',
  moyen: 'Moyen',
  a_travailler: 'A travailler',
  tres_sobre: 'Tres sobre en eau',
  raisonnable: 'Raisonnable',
  gourmand: 'Gourmand en eau'
};

export default function EnergyCalculator({ kind, locale }: { kind: 'pue' | 'wue'; locale: string }) {
  const [total, setTotal] = useState('');
  const [it, setIt] = useState('');
  const [water, setWater] = useState('');
  const [value, setValue] = useState<number | null>(null);
  const [band, setBand] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onCalc() {
    setPending(true);
    setError('');
    const body =
      kind === 'pue'
        ? { facility_kwh: Number(total), it_kwh: Number(it) }
        : { water_liters: Number(water), it_kwh: Number(it) };
    try {
      const res = await fetch(`/api/metrics/${kind}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Calcul refuse');
      setValue(data.value);
      setBand(LABELS[data.band] || data.band);
      setSource(data.source === 'rust' ? 'moteur Rust' : 'calcul local');
    } catch (e: any) {
      setValue(null);
      setError(e.message);
    } finally {
      setPending(false);
    }
  }

  const mail =
    value === null
      ? '#'
      : `mailto:contact@qinode.eu?subject=${encodeURIComponent(kind.toUpperCase() + ' ' + value.toFixed(3))}`;

  return (
    <div className="max-w-[640px] mx-auto border rounded-2xl bg-white p-6 space-y-4">
      {kind === 'pue' ? (
        <label className="block text-[13px] font-semibold">
          Electricite de toute la salle (kWh)
          <input type="number" min="0" value={total} onChange={(e) => setTotal(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" />
        </label>
      ) : (
        <label className="block text-[13px] font-semibold">
          Eau de la salle (litres)
          <input type="number" min="0" value={water} onChange={(e) => setWater(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" />
        </label>
      )}
      <label className="block text-[13px] font-semibold">
        Electricite des machines seulement (kWh)
        <input type="number" min="0" value={it} onChange={(e) => setIt(e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 font-normal" />
      </label>
      <button type="button" onClick={onCalc} disabled={pending} className="bg-[#0176D3] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">
        {pending ? 'Calcul…' : 'Calculer'}
      </button>
      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      {value !== null ? (
        <div className="rounded-xl bg-[#F8FAFC] border p-5">
          <div className="text-[12px] font-bold text-[#0176D3]">{kind === 'pue' ? 'PUE' : 'WUE'}</div>
          <div className="text-[40px] font-black">
            {value.toFixed(3)}
            {kind === 'wue' ? ' L/kWh' : ''}
          </div>
          <div className="mt-2 font-semibold">{band}</div>
          <p className="mt-2 text-[11px] text-slate-400">Apercu ({source}). Pas un tampon officiel.</p>
          <a href={mail} className="inline-block mt-4 bg-[#0176D3] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">Envoyer ce chiffre</a>
          <a href={`/${locale}/eed`} className="inline-block mt-4 ml-3 text-[13px] font-semibold text-[#0176D3]">Dossier europeen</a>
        </div>
      ) : null}
    </div>
  );
}
