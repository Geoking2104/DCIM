import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import RatioCalc from '@/components/metrics/RatioCalc';

export default function CuePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
        <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
          <h1 className="text-[32px] font-extrabold">Carbone · CUE</h1>
          <MetricsLinks locale={locale} current="/outils/cue" />
          <RatioCalc endpoint="/api/metrics/cue" fields={[{ key: 'co2_kg', label: 'CO₂ (kg)' }, { key: 'it_kwh', label: 'IT (kWh)' }]} unit="kg/kWh" />
        </div>
      </main>
    </Providers>
  );
}
