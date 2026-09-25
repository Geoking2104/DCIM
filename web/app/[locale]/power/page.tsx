import Header from '@/components/Header';
import Providers from '@/components/Providers';
import PowerFlow from '@/components/power/PowerFlow';
import PowerChart from '@/components/power/PowerChart';
import BatteryTable from '@/components/power/BatteryTable';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import LivePue from '@/components/metrics/LivePue';

export default function PowerPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header/>
      <div className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-[11px] text-[#706E6B]"><a href={`/${locale}`} className="hover:underline">Plateforme</a><span>/</span><span className="font-bold text-[#032D60]">Power Chain • Grid → Battery Cell</span></div>
        <h1 className="text-[28px] font-bold mt-2">Supervision Électrique Complète</h1>
        <div className="mt-3"><MetricsLinks locale={locale} current="/power" /></div>
        <div className="mt-4 max-w-[420px]"><LivePue /></div>
        <div className="mt-6"><PowerFlow/></div>
        <div className="mt-6 grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <PowerChart />
          <BatteryTable />
        </div>
      </div>
    </Providers>
  )
}
