'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { readLastRack } from '@/lib/lastRack';

type Point = {
  timestamp: string;
  grid_kw: number;
  ups_kw: number;
  pdu_kw: number;
  rack_kw: number;
  pue: number;
};

const RANGES = [
  { hours: 1, label: '1 h' },
  { hours: 24, label: '24 h' },
  { hours: 168, label: '7 j' },
  { hours: 720, label: '30 j' }
];

export default function EnergyTrends({ rackId }: { rackId?: string }) {
  const [rows, setRows] = useState<Point[]>([]);
  const [live, setLive] = useState(false);
  const [rack, setRack] = useState(rackId || '');
  const [hours, setHours] = useState(24);

  useEffect(() => {
    setRack(rackId || readLastRack() || '');
  }, [rackId]);

  useEffect(() => {
    let stop = false;
    async function load() {
      try {
        const params = new URLSearchParams({ hours: String(hours) });
        if (rack) params.set('rack', rack);
        const res = await fetch(`/api/clickhouse/power?${params}`);
        const json = await res.json();
        if (stop) return;
        const mapped: Point[] = (Array.isArray(json) ? json : []).map((p: any) => {
          const grid = Number(p.grid_kw) || 0;
          const rackKw = Number(p.rack_kw) || Number(p.pdu_kw) || 0;
          return {
            timestamp: p.timestamp,
            grid_kw: +grid.toFixed(2),
            ups_kw: Number(p.ups_kw) || 0,
            pdu_kw: Number(p.pdu_kw) || 0,
            rack_kw: +rackKw.toFixed(2),
            pue: rackKw > 0 ? +(grid / rackKw).toFixed(3) : 0
          };
        });
        setRows(mapped);
        setLive(mapped.length > 0);
      } catch {
        if (!stop) setLive(false);
      }
    }
    load();
    const id = setInterval(load, hours <= 1 ? 10000 : 60000);
    return () => { stop = true; clearInterval(id); };
  }, [rack, hours]);

  const stats = useMemo(() => {
    if (!rows.length) return null;
    const pues = rows.map((r) => r.pue).filter((v) => v > 0);
    const grids = rows.map((r) => r.grid_kw);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    return {
      pueMin: Math.min(...pues),
      pueMax: Math.max(...pues),
      pueAvg: avg(pues),
      gridAvg: avg(grids),
      gridMax: Math.max(...grids)
    };
  }, [rows]);

  const tickFmt = hours <= 24 ? 'HH:mm' : hours <= 168 ? 'dd/MM HH' : 'dd/MM';

  return (
    <div className="slds-card p-5 bg-white space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase font-bold text-[#706E6B]">Tendances énergétiques · historique</div>
          <div className="text-[16px] font-extrabold">Réseau, racks et PUE instantané</div>
          <div className="text-[11px] text-[#706E6B] font-mono mt-1">
            {rack || 'tous racks'} · GET /api/clickhouse/power?hours={hours}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {RANGES.map((r) => (
            <button
              key={r.hours}
              type="button"
              onClick={() => setHours(r.hours)}
              className={`px-3 py-1.5 rounded border text-[12px] ${hours === r.hours ? 'bg-[#032D60] text-white border-[#032D60]' : 'bg-white'}`}
            >
              {r.label}
            </button>
          ))}
          <span className={`w-2 h-2 rounded-full ${live ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[12px]">
          <Stat label="PUE moy." value={stats.pueAvg.toFixed(3)} />
          <Stat label="PUE min" value={stats.pueMin.toFixed(3)} />
          <Stat label="PUE max" value={stats.pueMax.toFixed(3)} />
          <Stat label="Réseau moy." value={`${stats.gridAvg.toFixed(0)} kW`} />
          <Stat label="Pic réseau" value={`${stats.gridMax.toFixed(0)} kW`} />
        </div>
      )}

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="timestamp" tickFormatter={(v) => format(new Date(v), tickFmt)} tick={{ fontSize: 10 }} />
            <YAxis yAxisId="kw" tick={{ fontSize: 10 }} unit=" kW" />
            <YAxis yAxisId="pue" orientation="right" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ fontSize: 11 }} labelFormatter={(v) => format(new Date(v as string), tickFmt)} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="kw" type="monotone" dataKey="grid_kw" name="Réseau kW" stroke="#032D60" strokeWidth={2} dot={false} />
            <Line yAxisId="kw" type="monotone" dataKey="rack_kw" name="Rack kW" stroke="#0176D3" strokeWidth={2} dot={false} />
            <Line yAxisId="pue" type="monotone" dataKey="pue" name="PUE instant." stroke="#FF6B35" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded px-3 py-2">
      <div className="text-[10px] uppercase text-[#706E6B]">{label}</div>
      <div className="font-black">{value}</div>
    </div>
  );
}
