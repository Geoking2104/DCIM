import MaturityQuiz from '@/components/MaturityQuiz';

export default function MaturitePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[960px] mx-auto px-6 py-10">
          <a href={`/${locale}`} className="text-[12px] opacity-80">← Accueil Qinode</a>
          <h1 className="mt-3 text-[32px] md:text-[44px] font-extrabold leading-[1.05]">
            Diagnostic de maturité
          </h1>
          <p className="mt-3 text-[16px] text-blue-100 max-w-[54ch]">
            Huit questions. Deux minutes. Un score par sujet — y compris le dossier énergie européen déjà là et celui qui arrive.
          </p>
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-12">
        <MaturityQuiz locale={locale || 'fr'} />
      </main>
    </div>
  );
}
