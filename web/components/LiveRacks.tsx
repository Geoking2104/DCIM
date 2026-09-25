'use client';
import { useQuery, useSubscription, gql } from '@apollo/client';
import { useState, useEffect } from 'react';
const RACKS_QUERY = gql`query Racks { racks { id name powerLoad capacity pue temperature status } }`;
const RACKS_SUB = gql`subscription OnRackUpdate { rackUpdated { id powerLoad temperature pue status } }`;
const mock = [
  {id:'RACK-01', powerLoad:0.21, capacity:0.34, pue:1.18, temperature:38, status:'Active'},
  {id:'RACK-02', powerLoad:0.28, capacity:0.34, pue:1.22, temperature:42, status:'Active'},
  {id:'RACK-05', powerLoad:0.31, capacity:0.34, pue:1.41, temperature:67.4, status:'Hotspot'},
  {id:'RACK-06', powerLoad:0.19, capacity:0.34, pue:1.15, temperature:36, status:'Active'},
];
export default function LiveRacks(){
  const { data, error } = useQuery(RACKS_QUERY, { pollInterval: 10000 });
  const { data: subData } = useSubscription(RACKS_SUB);
  const [racks, setRacks] = useState(mock);
  const [connected, setConnected] = useState(false);
  useEffect(()=>{ if (data?.racks?.length) { setRacks(data.racks); setConnected(true); } },[data]);
  useEffect(()=>{ if ((subData as any)?.rackUpdated) { setRacks(prev => prev.map(r => r.id===(subData as any).rackUpdated.id ? {...r, ...(subData as any).rackUpdated} : r)); } },[subData]);
  return (
    <div>
      <div className="flex items-center justify-between"><h3 className="font-bold text-[16px]">Operations • Data Table</h3><span className={`slds-badge ${connected?'bg-[#E6F8E9] text-[#0B7E25]':'bg-[#FFF0C2]'}`}>{connected?'GraphQL LIVE':'MOCK'}</span></div>
      <div className="slds-card mt-3 overflow-hidden">
        <img src="/images/img-0.svg" className="h-[160px] w-full object-cover" alt=""/>
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAF9] text-[11px] uppercase"><tr><th className="p-2.5 text-left">Rack</th><th className="p-2.5">Load</th><th className="p-2.5">PUE</th><th className="p-2.5">Temp</th><th className="p-2.5">Status</th></tr></thead>
          <tbody className="divide-y">
            {racks.map(r=>(
              <tr key={r.id} className={r.status==='Hotspot'?'bg-[#FFF9E6]':''}><td className="p-2.5 font-medium">{r.id}</td><td className="p-2.5">{r.powerLoad}/{r.capacity} MW</td><td className="p-2.5">{r.pue}</td><td className="p-2.5">{r.temperature}°C</td><td className="p-2.5"><span className="slds-badge bg-[#E6F8E9]">{r.status}</span></td></tr>
            ))}
          </tbody>
        </table>
        {error && <div className="p-2 text-[11px] bg-[#FFF0F0] text-[#C23934]">GraphQL error - fallback mock</div>}
      </div>
    </div>
  )
}
