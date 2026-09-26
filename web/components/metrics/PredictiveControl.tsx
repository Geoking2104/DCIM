'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { readLastRack } from '@/lib/lastRack';

export default function PredictiveControl() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const rack = readLastRack();
    const q = rack ? `?rack=${encodeURIComponent(rack)}` : '';
    fetch(`/api/metrics/predict${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-[13px] text-[#706E6B]">Calcul de la prévision…</p>;

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[#706E6B]">{data.model} · boucle fermée BMS : non (conseil seulement)</p>
      <div className="slds-card p-4 bg-white h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data.forecast || []}>
            <XAxis dataKey="at" tickFormatter={(v) => format(new Date(v), 'HH')} tick={{ fontSize: 10 }} />
            <YAxis yAxisId="kw" tick={{ fontSize: 10 }} />
            <YAxis yAxisId="pue" orientation="right" tick={{ fontSize: 10 }} />
            <Tooltip labelFormatter={(v) => format(new Date(v as string), 'dd/MM HH:mm')} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="kw" dataKey="grid_kw" name="Réseau kW prévu" stroke="#032D60" dot={false} />
            <Line yAxisId="pue" dataKey="pue" name="PUE prévu" stroke="#FF6B35" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-3">
        {(data.actions || []).map((a: any) => (
          <li key={a.id} className="slds-card p-4 bg-white">
            <div className="text-[11px] uppercase text-[#706E6B]">{format(new Date(a.when), 'dd/MM HH:mm')}</div>
            <div className="font-bold mt-1">{a.action}</div>
            <p className="text-[13px] text-slate-600 mt-1">{a.why}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
