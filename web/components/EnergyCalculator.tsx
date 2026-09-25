'use client';

import { useState } from 'react';
import { calcPue, calcWue } from '@/lib/energyCalcs';

export default function EnergyCalculator({ kind, locale }: { kind: 'pue' | 'wue'; locale: string }) {
  const [total, setTotal] = useState('');
  const [it, setIt] = useState('');
  const [water, setWater] = useState('');

  const itN = Number(it);
  const computed =
    kind === 'pue'
      ? total && it
        ? calcPue(Number(total), itN)
        : null
      : water !== '' && it
        ? calcWue(Number(water), itN)
        : null;

  const value = computed && computed.ok ? computed.value : null;
  const error = computed && !computed.ok ? computed.error : null;

  let band = '';
  if (kind === 'pue' && value !== null) {
    band = value < 1.2 ? 'Tres efficace' : value < 1.4 ? 'Bon' : value < 1.7 ? 'Moyen' : 'A travailler';
  }
  if (kind === 'wue' && value !== null) {
    band = value < 0.2 ? 'Tres sobre en eau' : value < 1 ? 'Raisonnable' : 'Gourmand en eau';
  }

  const mail =
    value === null
      ? '#'
      : `mailto:contact@qinode.eu?subject=${encodeURIComponent(kind.toUpperCase() + ' ' + value.toFixed(3))}&body=${encodeURIComponent(
          (kind === 'pue' ? 'PUE ' : 'WUE ') + value.toFixed(3) + (kind === 'wue' ? ' L/kWh' : '')
        )}`;

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
      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      {value !== null ? (
        <div className="rounded-xl bg-[#F8FAFC] border p-5">
          <div className="text-[12px] font-bold text-[#0176D3]">{kind === 'pue' ? 'PUE' : 'WUE'}</div>
          <div className="text-[40px] font-black">{value.toFixed(3)}{kind === 'wue' ? ' L/kWh' : ''}</div>
          <div className="mt-2 font-semibold">{band}</div>
          <p className="mt-2 text-[11px] text-slate-400">Apercu. Pas un tampon officiel.</p>
          <a href={mail} className="inline-block mt-4 bg-[#0176D3] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">Envoyer ce chiffre</a>
          <a href={`/${locale}/eed`} className="inline-block mt-4 ml-3 text-[13px] font-semibold text-[#0176D3]">Dossier europeen</a>
        </div>
      ) : null}
    </div>
  );
}
