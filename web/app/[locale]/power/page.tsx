import Header from '@/components/Header';
import Providers from '@/components/Providers';
import PowerFlow from '@/components/power/PowerFlow';
import PowerChart from '@/components/power/PowerChart';
import BatteryTable from '@/components/power/BatteryTable';

export default function PowerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header/>
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-[#706E6B]"><a href={`/${locale}`} className="hover:underline">Plateforme</a><span>/</span><span className="font-bold text-[#032D60]">Power Chain • Grid → Battery Cell</span></div>
        <h1 className="text-[28px] font-bold mt-2">Supervision Électrique Complète • SLDS Record Home</h1>
        <p className="text-[13px] text-[#444] max-w-[800px] mt-1">Traçabilité complète grid, groupe, UPS, PDU, rack, device, cellule batterie. Données temps réel ClickHouse (time-series) + Graph CSoT Neo4j (topologie). Blast-radius analysis si perte grid.</p>
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
            <div className="slds-card p-3 text-[11px]">
              <div className="font-bold">Anomalie détectée • AIOps</div>
              <div className="mt-1 text-[#444]">CELL-06 ΔT +8.4°C vs moyenne. Corrélation avec PDU-01 load 78%. Recommandation: vérifier connectique + airflow. Risque thermal-runaway 12% si &gt;40°C.</div>
              <div className="mt-2"><span className="slds-badge bg-[#0176D3] text-white">Local Ollama • Qdrant RAG</span></div>
            </div>
          </div>
        </div>
        <div className="mt-6 slds-card p-4">
          <div className="text-[12px] font-bold uppercase">Intégration DCIM existante • docker-compose.yml</div>
          <div className="mt-2 flex gap-2 text-[11px] flex-wrap">
            <code className="px-2 py-1 bg-[#FAFAF9] border rounded">Redpanda topic: power.metrics</code>
            <code className="px-2 py-1 bg-[#FAFAF9] border rounded">ClickHouse table: dcim.power_metrics (MergeTree)</code>
            <code className="px-2 py-1 bg-[#FAFAF9] border rounded">Neo4j: (:Grid)-[:FEEDS]-&gt;(:UPS)-[:FEEDS]-&gt;(:PDU)-[:FEEDS]-&gt;(:Rack)-[:CONTAINS]-&gt;(:BatteryCell)</code>
          </div>
        </div>
      </div>
    </Providers>
  )
}
