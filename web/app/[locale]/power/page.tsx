import Header from '@/components/Header';
import Providers from '@/components/Providers';
import PowerFlow from '@/components/power/PowerFlow';
import PowerChart from '@/components/power/PowerChart';
import BatteryTable from '@/components/power/BatteryTable';
import MetricsLinks from '@/components/metrics/MetricsLinks';

export default function PowerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header/>
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-[#706E6B]"><a href={`/${locale}`} className="hover:underline">Plateforme</a><span>/</span><span className="font-bold text-[#032D60]">Power Chain • Grid → Battery Cell</span></div>
        <h1 className="text-[28px] font-bold mt-2">Supervision Électrique Complète • SLDS Record Home</h1>
        <p className="text-[13px] text-[#444] max-w-[800px] mt-1">Traçabilité complète grid, groupe, UPS, PDU, rack, device, cellule batterie. Données temps réel ClickHouse (time-series) + Graph CSoT Neo4j (topologie).</p>
        <div className="mt-3"><MetricsLinks locale={locale} current="/power" /></div>
        <div className="mt-6">
          <PowerFlow/>
        </div>
        <div className="mt-6 grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <PowerChart rackId="RACK-05"/>
          <div className="space-y-4">
            <div className="slds-card p-4 bg-[#032D60] text-white">
              <div className="text-[11px] uppercase opacity-70">ClickHouse Query • Live</div>
              <pre className="text-[11px] mt-2 whitespace-pre-wrap">SELECT toStartOfMinute(timestamp) as ts,
  avg(grid_power_kw) as grid,
  avg(ups_power_kw) as ups,
  avg(battery_cell_temp) as temp
FROM dcim.power_metrics
WHERE now()-1h GROUP BY ts ORDER BY ts</pre>
            </div>
            <BatteryTable rackId="RACK-05"/>
          </div>
        </div>
      </div>
    </Providers>
  )
}
