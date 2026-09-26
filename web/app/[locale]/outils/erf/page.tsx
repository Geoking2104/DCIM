import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import RatioCalc from '@/components/metrics/RatioCalc';

export default function ErfPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
        <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
          <h1 className="text-[32px] font-extrabold">Chaleur réutilisée · ERF</h1>
          <MetricsLinks locale={locale} current="/outils/erf" />
          <RatioCalc endpoint="/api/metrics/erf" fields={[{ key: 'reused_kwh', label: 'Chaleur réutilisée (kWh)' }, { key: 'facility_kwh', label: 'Salle (kWh)' }]} unit="" />
        </div>
      </main>
    </Providers>
  );
}
