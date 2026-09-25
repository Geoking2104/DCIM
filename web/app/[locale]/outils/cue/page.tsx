import MetricsLinks from '@/components/metrics/MetricsLinks';
import RatioCalc from '@/components/metrics/RatioCalc';

export default function CuePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <a href={`/${locale}/outils`} className="text-[12px] opacity-80">← Calculs rapides</a>
          <h1 className="mt-3 text-[32px] font-extrabold">Carbone · CUE</h1>
          <p className="mt-3 text-blue-100">kg CO₂ ÷ kWh IT. Facteur d’émission × électricité salle, ou mesure directe.</p>
        </div>
      </header>
      <main className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
        <MetricsLinks locale={locale} current="/outils/cue" />
        <RatioCalc endpoint="/api/metrics/cue" fields={[{ key: 'co2_kg', label: 'CO₂ (kg)' }, { key: 'it_kwh', label: 'IT (kWh)' }]} unit="kg/kWh" />
      </main>
    </div>
  );
}
