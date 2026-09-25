import EnergyCalculator from '@/components/EnergyCalculator';

export default function PuePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[720px] mx-auto px-6 py-10">
          <a href={`/${locale}/outils`} className="text-[12px] opacity-80">← Calculs rapides</a>
          <h1 className="mt-3 text-[32px] md:text-[40px] font-extrabold">Efficacité électrique</h1>
          <p className="mt-3 text-blue-100">Salle entière ÷ machines. Prenez la même période (un mois de facture suffit pour tester).</p>
        </div>
      </header>
      <main className="px-6 py-12">
        <EnergyCalculator kind="pue" locale={locale || 'fr'} />
      </main>
    </div>
  );
}
