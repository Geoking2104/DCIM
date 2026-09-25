import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';

export const dynamic = 'force-dynamic';

const ROWS = [
  ['Collecte', 'Telegraf', 'SNMP PDU + Redfish BMC, profil monitor'],
  ['Historique', 'ClickHouse', 'dcim.power_metrics · GET /api/metrics/live'],
  ['Alerte', 'Prometheus', 'scrape :9363 · localhost:9090'],
  ['Graphe', 'Neo4j', 'inventaire, pas la télémétrie'],
  ['Face ops', 'Grafana', 'optionnel, pas démarré']
];

export default function SupervisionPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <div className="max-w-[800px] mx-auto px-6 py-8 space-y-6">
        <h1 className="text-[28px] font-extrabold">Supervision</h1>
        <MetricsLinks locale={locale} />
        <table className="w-full text-[13px] bg-white border">
          <tbody>
            {ROWS.map(([a, b, c]) => (
              <tr key={a} className="border-t">
                <td className="p-3 font-bold">{a}</td>
                <td className="p-3">{b}</td>
                <td className="p-3 text-[#706E6B]">{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[12px] text-[#706E6B]">Fichiers : ops/MONITORING.md · docker-compose.monitor.yml</p>
      </div>
    </Providers>
  );
}
