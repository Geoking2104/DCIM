'use client';
import { useEffect, useState } from 'react';
import { readLastRack } from '@/lib/lastRack';

export default function LivePue({ rackId }: { rackId?: string }) {
  const [pue, setPue] = useState<number | null>(null);
  const [ok, setOk] = useState(false);
  const [rack, setRack] = useState(rackId || '');

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
    <div className="slds-card p-4 bg-white flex items-center justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase font-bold text-[#706E6B]">PUE instantané · GET /api/metrics/live</div>
        <div className="text-[28px] font-black">{pue ? pue.toFixed(3) : '—'}</div>
        <div className="text-[11px] text-[#706E6B] font-mono">{rack || '—'} · 10 s · pas un PUE ISO</div>
      </div>
      <span className={`text-[11px] ${ok ? 'text-green-700' : 'text-[#706E6B]'}`}>{ok ? 'ClickHouse' : 'hors ligne'}</span>
    </div>
  );
}
