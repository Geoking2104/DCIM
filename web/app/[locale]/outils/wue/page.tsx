import EnergyCalculator from '@/components/EnergyCalculator';
import MetricsLinks from '@/components/metrics/MetricsLinks';

export default function WuePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <a href={`/${locale}/outils`} className="text-[12px] opacity-80">← Calculs rapides</a>
          <h1 className="mt-3 text-[32px] md:text-[40px] font-extrabold">Efficacité eau · WUE</h1>
          <p className="mt-3 text-blue-100">Litres de la salle ÷ kWh des machines. Compteur d’eau + même mois que l’électricité.</p>
        </div>
      </header>
      <main className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
        <MetricsLinks locale={locale} current="/outils/wue" />
        <EnergyCalculator kind="wue" locale={locale || 'fr'} />
      </main>
    </div>
  );
}
