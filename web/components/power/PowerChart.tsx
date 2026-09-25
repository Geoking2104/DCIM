'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface Point { timestamp: string; grid_kw: number; ups_kw: number; pdu_kw: number; rack_kw: number; cell_temp: number; voltage: number; }

export default function PowerChart({ rackId }: { rackId?: string }) {
  const [data, setData] = useState<Point[]>([]);
  const [live, setLive] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/clickhouse/power${rackId ? `?rack=${rackId}` : ''}`);
      const json = await res.json();
      setData(json);
      setLive(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, [rackId]);

  return (
    <div className="slds-card p-5">
      <div className="flex justify-between items-center mb-4">
        <div><div className="text-[12px] font-bold uppercase">Power Timeseries • ClickHouse • Last 60 min • SLDS Chart Pattern</div><div className="text-[11px] text-[#706E6B]">SELECT toStartOfMinute(timestamp), avg(power) FROM dcim.power_metrics WHERE now()-1h GROUP BY timestamp</div></div>
        <div className="flex gap-2 items-center"><span className={`w-2 h-2 rounded-full ${live?'bg-green-500 animate-pulse':'bg-gray-300'}`}/><span className="text-[11px]">{live?'LIVE 10s poll':'connecting...'}</span></div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5"/>
            <XAxis dataKey="timestamp" tickFormatter={(v)=>format(new Date(v),'HH:mm')} tick={{fontSize:10}}/>
            <YAxis tick={{fontSize:10}}/>
            <Tooltip contentStyle={{fontSize:11}} labelFormatter={(v)=>format(new Date(v as string),'HH:mm:ss')}/>
            <Legend wrapperStyle={{fontSize:11}}/>
            <Line type="monotone" dataKey="grid_kw" name="Grid kW" stroke="#032D60" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="ups_kw" name="UPS kW" stroke="#0176D3" strokeWidth={2} dot={false}/>
            <Line type="monotone" dataKey="pdu_kw" name="PDU kW" stroke="#1B96FF" strokeWidth={1.5} dot={false}/>
            <Line type="monotone" dataKey="rack_kw" name="Rack kW" stroke="#706E6B" strokeWidth={1} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div className="h-[100px]"><ResponsiveContainer><LineChart data={data}><Line type="monotone" dataKey="cell_temp" stroke="#FF6B35" dot={false} strokeWidth={1.5}/><XAxis hide dataKey="timestamp"/><YAxis hide domain={[28,40]}/><Tooltip/></LineChart></ResponsiveContainer><div className="text-[10px] text-center text-[#706E6B]">Battery Cell Temp °C</div></div>
        <div className="h-[100px]"><ResponsiveContainer><LineChart data={data}><Line type="monotone" dataKey="voltage" stroke="#0B7E25" dot={false} strokeWidth={1.5}/><XAxis hide dataKey="timestamp"/><YAxis hide domain={[410,420]}/><Tooltip/></LineChart></ResponsiveContainer><div className="text-[10px] text-center text-[#706E6B]">Voltage V</div></div>
      </div>
    </div>
  )
}
