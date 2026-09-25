'use client';
import { useState } from 'react';

export default function RatioCalc({
  endpoint,
  fields,
  unit
}: {
  endpoint: string;
  fields: { key: string; label: string }[];
  unit: string;
}) {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [out, setOut] = useState<{ value: number; band: string } | null>(null);
  const [err, setErr] = useState('');

  async function run() {
    setErr('');
    const body: Record<string, number> = {};
    fields.forEach((f) => { body[f.key] = Number(vals[f.key] || 0); });
    const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) { setOut(null); setErr(data.error || 'refus'); return; }
    setOut({ value: data.value, band: data.band });
  }

  return (
    <div className="bg-white border rounded-2xl p-6 space-y-4">
      {fields.map((f) => (
        <label key={f.key} className="block text-[13px] font-semibold">
          {f.label}
          <input type="number" min="0" className="mt-1 w-full border rounded px-3 py-2 font-normal" value={vals[f.key] || ''} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))} />
        </label>
      ))}
      <button type="button" onClick={run} className="px-4 py-2 rounded bg-[#0176D3] text-white text-[13px]">Calculer</button>
      {err && <p className="text-[13px] text-[#C23934]">{err}</p>}
      {out && (
        <div className="rounded-xl bg-[#F8FAFC] border p-4">
          <div className="text-[36px] font-black">{out.value.toFixed(3)} {unit}</div>
          <div className="text-[13px]">{out.band}</div>
        </div>
      )}
    </div>
  );
}
