'use client';

export type TopoDevice = {
  id: string;
  name: string;
  model?: string;
  startU: number;
  heightU: number;
};

export type TopoRack = {
  id: string;
  name: string;
  heightU: number;
  siteId?: string;
  devices?: TopoDevice[];
};

const COLORS = ['#0176D3', '#0B7E25', '#9050E9', '#CA8501', '#BA0517', '#0B827C'];

export default function RackElevation({
  rack,
  selectedId,
  onSelect
}: {
  rack: TopoRack;
  selectedId?: string;
  onSelect?: (id: string) => void;
}) {
  const hu = Math.max(rack.heightU || 42, 1);
  const units = Array.from({ length: hu }, (_, i) => hu - i);
  const devices = [...(rack.devices || [])];

  function occupant(u: number) {
    return devices.find((d) => u >= d.startU && u < d.startU + d.heightU);
  }

  return (
    <div className="rounded-lg border bg-[#0B1C33] text-white overflow-hidden">
      <div className="px-3 py-2 border-b border-white/10 flex justify-between text-[11px]">
        <span className="font-bold tracking-wide">{rack.name}</span>
        <span className="opacity-70">{hu}U · {devices.length} équip.</span>
      </div>
      <div className="p-2 max-h-[640px] overflow-auto">
        {units.map((u) => {
          const d = occupant(u);
          const top = d && u === d.startU + d.heightU - 1;
          const color = d ? COLORS[Math.abs(hash(d.id)) % COLORS.length] : undefined;
          return (
            <div key={u} className="flex items-stretch gap-1">
              <div className="w-7 text-[9px] text-right pr-1 text-white/40 leading-[18px] font-mono">{u}</div>
              <button
                type="button"
                onClick={() => d && onSelect?.(d.id)}
                className="flex-1 h-[18px] mb-px rounded-[2px] text-left px-2 text-[10px] truncate"
                style={{
                  background: d ? color : 'rgba(255,255,255,0.04)',
                  outline: selectedId && d?.id === selectedId ? '2px solid #fff' : undefined,
                  opacity: d ? 1 : 0.5
                }}
              >
                {top ? `${d!.name} · ${d!.heightU}U` : ''}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function hash(s: string) {
  return [...s].reduce((a, c) => a + c.charCodeAt(0), 0);
}
