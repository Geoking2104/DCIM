import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EnergyCalculator from '@/components/EnergyCalculator';
import MetricsLinks from '@/components/metrics/MetricsLinks';

export default function WuePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
        <div className="max-w-[720px] mx-auto px-6 py-8 space-y-6">
          <h1 className="text-[32px] font-extrabold">Efficacité eau · WUE</h1>
          <MetricsLinks locale={locale} current="/outils/wue" />
          <EnergyCalculator kind="wue" locale={locale || 'fr'} />
        </div>
      </main>
    </Providers>
  );
}
