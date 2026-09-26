'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { readLastRack } from '@/lib/lastRack';

export default function LivePue({ rackId }: { rackId?: string }) {
  const [pue, setPue] = useState<number | null>(null);
  const [ok, setOk] = useState(false);
  const [rack, setRack] = useState(rackId || '');
  const [hist, setHist] = useState<{ t: number; v: number }[]>([]);

  useEffect(() => {
    setRack(rackId || readLastRack() || 'RACK-05');
  }, [rackId]);

  useEffect(() => {
    if (!rack) return;
    let stop = false;
    async function tick() {
      try {
        const res = await fetch(`/api/metrics/live?rack=${encodeURIComponent(rack)}`);
        const data = await res.json();
        if (!stop && data.ok) {
          setPue(data.value);
          setOk(true);
          setHist((h) => [...h.slice(-29), { t: Date.now(), v: data.value }]);
        } else if (!stop) setOk(false);
      } catch {
        if (!stop) setOk(false);
      }
    }
    tick();
    const id = setInterval(tick, 10000);
    return () => { stop = true; clearInterval(id); };
  }, [rack]);

  return (
    <div className="slds-card p-4 bg-white grid sm:grid-cols-[1fr_220px] gap-3 items-center">
      <div>
        <div className="text-[11px] uppercase font-bold text-[#706E6B]">PUE instantané · GET /api/metrics/live</div>
        <div className="text-[28px] font-black">{pue ? pue.toFixed(3) : '—'}</div>
        <div className="text-[11px] text-[#706E6B] font-mono">{rack || '—'} · 10 s · pas un PUE ISO</div>
        <span className={`text-[11px] ${ok ? 'text-green-700' : 'text-[#706E6B]'}`}>{ok ? 'ClickHouse' : 'hors ligne'}</span>
      </div>
      <div className="h-[80px]">
        {hist.length > 1 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={hist}>
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip formatter={(v: number) => v.toFixed(3)} />
              <Line type="monotone" dataKey="v" stroke="#0176D3" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
