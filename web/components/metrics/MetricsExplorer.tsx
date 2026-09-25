'use client';
import { useState } from 'react';

const CARDS = [
  { id: 'pue', title: 'PUE', formula: 'salle kWh / IT kWh', hint: '1.0 = parfait · <1.2 excellent', href: 'pue' },
  { id: 'wue', title: 'WUE', formula: 'litres / IT kWh', hint: '<0.2 L/kWh = sobre', href: 'wue' },
  { id: 'cue', title: 'CUE', formula: 'kg CO₂ / IT kWh', hint: 'facteur réseau × PUE', href: 'cue' },
  { id: 'erf', title: 'ERF', formula: 'chaleur réutilisée / salle', hint: '10 % 2026 · 15 % 2027 · 20 % 2028', href: 'erf' }
];

export default function MetricsExplorer({ locale }: { locale: string }) {
  const [it, setIt] = useState('1000');
  const [facility, setFacility] = useState('1200');
  const [water, setWater] = useState('150');
  const [co2, setCo2] = useState('50');
  const [reused, setReused] = useState('120');
  const [out, setOut] = useState<Record<string, { value: number; band: string }>>({});
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    try {
      const posts = await Promise.all([
        fetch('/api/metrics/pue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ facility_kwh: +facility, it_kwh: +it }) }),
        fetch('/api/metrics/wue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ water_liters: +water, it_kwh: +it }) }),
        fetch('/api/metrics/cue', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ co2_kg: +co2, it_kwh: +it }) }),
        fetch('/api/metrics/erf', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reused_kwh: +reused, facility_kwh: +facility }) })
      ]);
      const jsons = await Promise.all(posts.map((p) => p.json()));
      const next: Record<string, { value: number; band: string }> = {};
      jsons.forEach((j) => {
        if (j.error) throw new Error(j.error);
        next[j.kind] = { value: j.value, band: j.band };
      });
      setOut(next);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
      <div>
        <p className="text-[11px] uppercase font-bold text-[#706E6B]">Performance</p>
        <h1 className="text-[28px] font-extrabold">Métriques salle / machines</h1>
        <p className="text-[13px] text-[#444] max-w-[62ch]">
          Quatre indicateurs ISO/IEC 30134 + EED. Calcul local ou sidecar Rust. La chaîne électrique live reste sur Power.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {CARDS.map((c) => (
          <div key={c.id} className="slds-card p-4 bg-white">
            <div className="text-[11px] uppercase text-[#0176D3] font-bold">{c.title}</div>
            <div className="text-[28px] font-black">{out[c.id] ? out[c.id].value.toFixed(3) : '—'}</div>
            <div className="text-[12px] text-[#706E6B]">{c.formula}</div>
            <div className="text-[12px] mt-1">{out[c.id]?.band || c.hint}</div>
          </div>
        ))}
      </div>
      <div className="slds-card p-5 bg-white grid sm:grid-cols-2 gap-3">
        <Field label="IT (kWh)" value={it} onChange={setIt} />
        <Field label="Salle (kWh)" value={facility} onChange={setFacility} />
        <Field label="Eau (L)" value={water} onChange={setWater} />
        <Field label="CO₂ (kg)" value={co2} onChange={setCo2} />
        <Field label="Chaleur réutilisée (kWh)" value={reused} onChange={setReused} />
        <div className="flex items-end">
          <button type="button" onClick={run} className="px-4 py-2 rounded bg-[#032D60] text-white text-[13px]">Calculer les 4</button>
        </div>
      </div>
      {err && <p className="text-[13px] text-[#C23934]">{err}</p>}
      <div className="flex flex-wrap gap-4 text-[13px]">
        <a className="underline" href={`/${locale}/outils/pue`}>Calculatrice PUE</a>
        <a className="underline" href={`/${locale}/outils/wue`}>Calculatrice WUE</a>
        <a className="underline" href={`/${locale}/power`}>Chaîne puissance live</a>
        <a className="underline" href={`/${locale}/eed`}>Dossier EED</a>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="text-[13px] font-semibold">
      {label}
      <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full border rounded px-3 py-2 font-normal" />
    </label>
  );
}
