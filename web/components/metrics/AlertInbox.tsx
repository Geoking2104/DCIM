'use client';
import { useEffect, useState } from 'react';

export default function AlertInbox() {
  const [items, setItems] = useState<{ at: string; title: string; status: string }[]>([]);

  useEffect(() => {
    let stop = false;
    async function tick() {
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (!stop) setItems(data.items || []);
    }
    tick();
    const id = setInterval(tick, 10000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  return (
    <div className="bg-white border rounded-xl p-4">
      <div className="text-[11px] uppercase font-bold text-[#706E6B]">Boîte Grafana · POST /api/alerts</div>
      {items.length === 0 && <p className="text-[13px] mt-2 text-[#706E6B]">Aucune alerte reçue sur cette instance.</p>}
      <ul className="mt-2 space-y-1 text-[13px]">
        {items.map((it, i) => (
          <li key={i} className="flex justify-between gap-3 border-t pt-1">
            <span className="font-semibold">{it.title}</span>
            <span>{it.status}</span>
            <span className="text-[#706E6B] font-mono text-[11px]">{it.at}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
