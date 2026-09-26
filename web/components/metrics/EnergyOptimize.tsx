'use client';
import { useEffect, useState } from 'react';
import { readLastRack } from '@/lib/lastRack';

type Hint = { id: string; title: string; detail: string; savingKw: number; severity: string };

export default function EnergyOptimize() {
  const [data, setData] = useState<{ pueAvg: number; overheadKw: number; hints: Hint[] } | null>(null);

  useEffect(() => {
    const rack = readLastRack();
    const q = rack ? `?rack=${encodeURIComponent(rack)}` : '';
    fetch(`/api/metrics/optimize${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-[13px] text-[#706E6B]">Analyse 24 h…</p>;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="slds-card p-4 bg-white">
          <div className="text-[11px] uppercase text-[#706E6B]">PUE moyen 24 h</div>
          <div className="text-[28px] font-black">{data.pueAvg.toFixed(3)}</div>
        </div>
        <div className="slds-card p-4 bg-white">
          <div className="text-[11px] uppercase text-[#706E6B]">Surplus réseau − rack</div>
          <div className="text-[28px] font-black">{data.overheadKw.toFixed(0)} kW</div>
        </div>
      </div>
      <ul className="space-y-3">
        {data.hints.map((h) => (
          <li key={h.id} className="slds-card p-4 bg-white">
            <div className="flex justify-between gap-3">
              <div className="font-bold">{h.title}</div>
              {h.savingKw > 0 && <div className="text-[12px] text-green-700">~ {h.savingKw} kW</div>}
            </div>
            <p className="text-[13px] text-slate-600 mt-1">{h.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
