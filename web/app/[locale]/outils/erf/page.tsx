import MetricsLinks from '@/components/metrics/MetricsLinks';
import RatioCalc from '@/components/metrics/RatioCalc';

export default function ErfPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <a href={`/${locale}/outils`} className="text-[12px] opacity-80">← Calculs rapides</a>
          <h1 className="mt-3 text-[32px] font-extrabold">Chaleur réutilisée · ERF</h1>
          <p className="mt-3 text-blue-100">kWh réutilisés ÷ kWh salle. Paliers EnEfG 10 / 15 / 20 %.</p>
        </div>
      </header>
      <main className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
        <MetricsLinks locale={locale} current="/outils/erf" />
        <RatioCalc endpoint="/api/metrics/erf" fields={[{ key: 'reused_kwh', label: 'Chaleur réutilisée (kWh)' }, { key: 'facility_kwh', label: 'Salle (kWh)' }]} unit="" />
      </main>
    </div>
  );
}
