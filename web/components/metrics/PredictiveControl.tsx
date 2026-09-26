'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { readLastRack } from '@/lib/lastRack';

export default function PredictiveControl() {
  const [data, setData] = useState<any>(null);
  const [log, setLog] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  async function refreshLog() {
    const res = await fetch('/api/metrics/predict/actions');
    const json = await res.json();
    setLog(json.items || []);
  }

  useEffect(() => {
    const rack = readLastRack();
    const q = rack ? `?rack=${encodeURIComponent(rack)}` : '';
    fetch(`/api/metrics/predict${q}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
    refreshLog();
  }, []);

  async function decide(a: any, status: 'planned' | 'dismissed') {
    setMsg('');
    await fetch('/api/metrics/predict/actions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ actionId: a.id, action: a.action, when: a.when, status })
    });
    setMsg(status === 'planned' ? 'Action planifiée (pas envoyée au BMS).' : 'Action écartée.');
    refreshLog();
  }

  if (!data) return <p className="text-[13px] text-[#706E6B]">Calcul de la prévision…</p>;

  return (
    <div className="space-y-4">
      <p className="text-[12px] text-[#706E6B]">{data.model} · boucle fermée BMS : non</p>
      {msg && <p className="text-[13px] text-green-800">{msg}</p>}
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
            <div className="flex gap-2 mt-3">
              <button type="button" onClick={() => decide(a, 'planned')} className="px-3 py-1.5 text-[12px] rounded bg-[#032D60] text-white">Planifier</button>
              <button type="button" onClick={() => decide(a, 'dismissed')} className="px-3 py-1.5 text-[12px] rounded border">Écarter</button>
            </div>
          </li>
        ))}
      </ul>
      {log.length > 0 && (
        <div className="text-[12px] text-[#706E6B]">
          Journal : {log.map((l) => `${l.status} · ${l.actionId}`).join(' — ')}
        </div>
      )}
    </div>
  );
}
