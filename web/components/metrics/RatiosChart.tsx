'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#032D60', '#0176D3', '#1B96FF', '#0B7E25'];

export default function RatiosChart({ out }: { out: Record<string, { value: number; band: string }> }) {
  const data = ['pue', 'wue', 'cue', 'erf']
    .filter((k) => out[k])
    .map((k) => ({ name: k.toUpperCase(), value: Number(out[k].value.toFixed(3)) }));
  if (!data.length) return null;
  return (
    <div className="slds-card p-4 bg-white h-[240px]">
      <div className="text-[11px] uppercase font-bold text-[#706E6B] mb-2">Comparaison des 4 ratios</div>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
