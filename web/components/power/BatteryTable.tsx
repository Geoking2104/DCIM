'use client';
import { useEffect, useState } from 'react';

export default function BatteryTable({ rackId='RACK-05' }: { rackId?: string }) {
  const [cells, setCells] = useState<any[]>([]);
  useEffect(()=>{
    fetch(`/api/clickhouse/battery?rack=${rackId}`).then(r=>r.json()).then(setCells);
    const iv=setInterval(()=>fetch(`/api/clickhouse/battery?rack=${rackId}`).then(r=>r.json()).then(setCells),15000);
    return ()=>clearInterval(iv);
  },[rackId]);

  return (
    <div className="slds-card overflow-hidden">
      <div className="p-3 border-b flex justify-between"><div className="text-[12px] font-bold uppercase">Battery Cells • {rackId} • Neo4j CSoT + ClickHouse TS</div><span className="slds-badge bg-[#FFF0C2] text-[#7A4E00]">CELL-06 warning</span></div>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead className="bg-[#FAFAF9] uppercase text-[10px] text-[#706E6B]"><tr><th className="p-2 text-left">Cell</th><th className="p-2">Voltage</th><th className="p-2">Temp</th><th className="p-2">SoC</th><th className="p-2">Status</th><th className="p-2">Last</th></tr></thead>
          <tbody className="divide-y">
            {cells.map(c=>(
              <tr key={c.cell_id} className={c.status==='warning'?'bg-[#FFF9E6]':''}>
                <td className="p-2 font-mono font-bold">{c.cell_id}</td>
                <td className="p-2">{c.voltage.toFixed(2)} V</td>
                <td className={`p-2 ${c.temp>37?'text-orange-600 font-bold':''}`}>{c.temp.toFixed(1)}°C</td>
                <td className="p-2">{c.soc.toFixed(1)}%</td>
                <td className="p-2"><span className={`slds-badge ${c.status==='ok'?'bg-[#E6F8E9] text-[#0B7E25]':'bg-[#FFF0C2] text-[#7A4E00]'}`}>{c.status}</span></td>
                <td className="p-2 text-[#706E6B]">{new Date(c.last_update).toLocaleTimeString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
