'use client';
import { useState } from 'react';

const nodes = [
  { id: 'grid', label: 'GRID', sub: '20kV • Enedis', icon: '⚡', kw: 1302, status: 'ok' },
  { id: 'gen', label: 'GROUPE', sub: 'Diesel • 2MW', icon: '🔋', kw: 0, status: 'standby' },
  { id: 'ups', label: 'UPS-01', sub: 'Battery Backup', icon: '🔌', kw: 1240, status: 'ok', detail: '92% • Online' },
  { id: 'pdu', label: 'PDU-01', sub: '415V 3-PH 50Hz', icon: '⎆', kw: 1215, status: 'ok', detail: '78% load' },
  { id: 'rack', label: 'RACK-05', sub: 'Row C', icon: '▤', kw: 310, status: 'warning', detail: '67.4°C hotspot' },
  { id: 'device', label: 'SRV-12', sub: 'Mount 22U', icon: '🖥️', kw: 4.2, status: 'ok' },
  { id: 'cell', label: 'CELL-06', sub: 'Li-Ion', icon: '◉', kw: 0.015, status: 'warning', detail: '38.2°C' },
];

export default function PowerFlow({ onSelect }: { onSelect?: (id: string) => void }) {
  const [selected, setSelected] = useState('ups');
  return (
    <div className="slds-card p-5 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12px] font-bold uppercase tracking-wide">Power Chain • Grid → Battery Cell • SLDS Path Pattern</div>
        <div className="flex gap-2"><span className="slds-badge bg-[#E6F8E9] text-[#0B7E25]">Live GraphQL</span><span className="slds-badge bg-[#E6F2FE] text-[#0176D3]">ClickHouse TS</span></div>
      </div>
      <div className="flex items-center gap-0 min-w-[900px]">
        {nodes.map((node, idx) => (
          <div key={node.id} className="flex items-center">
            <button
              onClick={() => { setSelected(node.id); onSelect?.(node.id); }}
              className={`w-[140px] p-3 rounded border-2 text-left transition-all ${selected===node.id?'border-[#0176D3] bg-[#E6F2FE] shadow':'border-[#E5E5E5] bg-white hover:border-[#0176D3]/50'} ${node.status==='warning'?'border-orange-300 bg-[#FFF9E6]':''} ${node.status==='standby'?'opacity-60':''}`}
            >
              <div className="flex justify-between"><span className="text-[16px]">{node.icon}</span><span className={`w-2 h-2 rounded-full ${node.status==='ok'?'bg-green-500':node.status==='warning'?'bg-orange-400':'bg-gray-300'}`}/></div>
              <div className="font-bold text-[12px] mt-1">{node.label}</div>
              <div className="text-[10px] text-[#706E6B]">{node.sub}</div>
              {node.kw>0 && <div className="text-[11px] font-mono font-bold mt-1">{node.kw} kW</div>}
              {node.detail && <div className="text-[10px] text-[#706E6B] mt-0.5">{node.detail}</div>}
            </button>
            {idx < nodes.length -1 && <div className="w-[28px] h-[2px] bg-[#0176D3] relative"><div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-[#0176D3] rotate-45"/></div>}
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-3 text-[11px]">
        <div className="bg-[#FAFAF9] p-2 rounded"><span className="text-[#706E6B]">Efficiency Grid→Rack</span><div className="font-bold">94.7%</div></div>
        <div className="bg-[#FAFAF9] p-2 rounded"><span className="text-[#706E6B]">Loss UPS</span><div className="font-bold">2.1% • 26kW</div></div>
        <div className="bg-[#FAFAF9] p-2 rounded"><span className="text-[#706E6B]">Battery Runtime</span><div className="font-bold">12m 34s @ 1.24MW</div></div>
        <div className="bg-[#FAFAF9] p-2 rounded"><span className="text-[#706E6B]">Cell ΔT max</span><div className="font-bold text-orange-600">8.4°C • CELL-06</div></div>
      </div>
    </div>
  )
}
