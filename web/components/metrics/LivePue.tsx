'use client';
import { useEffect, useState } from 'react';

export default function LivePue({ rackId }: { rackId?: string }) {
  const [pue, setPue] = useState<number | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let stop = false;
    async function tick() {
      try {
        const res = await fetch(`/api/clickhouse/power${rackId ? `?rack=${rackId}` : ''}`);
        const rows = await res.json();
        const last = Array.isArray(rows) ? rows[rows.length - 1] : null;
        const grid = Number(last?.grid_kw);
        const it = Number(last?.rack_kw || last?.pdu_kw);
        if (!stop && grid > 0 && it > 0) {
          setPue(grid / it);
          setOk(true);
        }
      } catch {
        if (!stop) setOk(false);
      }
    }
    tick();
    const id = setInterval(tick, 10000);
    return () => { stop = true; clearInterval(id); };
  }, [rackId]);

  return (
    <div className="slds-card p-4 bg-white flex items-center justify-between gap-3">
      <div>
        <div className="text-[11px] uppercase font-bold text-[#706E6B]">PUE instantané · grid / rack</div>
        <div className="text-[28px] font-black">{pue ? pue.toFixed(3) : '—'}</div>
        <div className="text-[11px] text-[#706E6B]">Approximation 10 s. Pas un PUE de période ISO.</div>
      </div>
      <span className={`text-[11px] ${ok ? 'text-green-700' : 'text-[#706E6B]'}`}>{ok ? 'ClickHouse' : 'hors ligne'}</span>
    </div>
  );
}
