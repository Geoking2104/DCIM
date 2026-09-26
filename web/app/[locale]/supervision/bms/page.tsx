import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import BmsPanel from '@/components/metrics/BmsPanel';

export const dynamic = 'force-dynamic';

export default function BmsPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <div>
          <p className="text-[11px] uppercase font-bold text-[#706E6B]">Supervision</p>
          <h1 className="text-[28px] font-extrabold">BMS · points froid / air</h1>
          <p className="mt-2 text-[14px] text-slate-600 max-w-[64ch]">
            Lecture démo BACnet / Modbus. Les actions prédictives planifiées apparaissent en écriture en attente — jamais envoyées tant que BMS_URL n’est pas branché.
          </p>
        </div>
        <MetricsLinks locale={locale} current="/supervision/bms" />
        <BmsPanel />
      </div>
    </Providers>
  );
}
