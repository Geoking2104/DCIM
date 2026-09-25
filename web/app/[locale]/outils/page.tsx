export default function OutilsPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#032D60]">
      <header className="bg-[#032D60] text-white">
        <div className="max-w-[960px] mx-auto px-6 py-10">
          <a href={`/${locale}`} className="text-[12px] opacity-80">← Accueil Qinode</a>
          <h1 className="mt-3 text-[32px] md:text-[44px] font-extrabold">Calculs rapides</h1>
          <p className="mt-3 text-blue-100 max-w-[52ch]">Deux chiffres à partir de vos factures. Pour le suivi vivant : prises et dossier européen.</p>
        </div>
      </header>
      <main className="max-w-[960px] mx-auto px-6 py-12 grid md:grid-cols-2 gap-6">
        <a href={`/${locale}/outils/pue`} className="block bg-white border rounded-2xl p-6 hover:border-[#0176D3]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">PUE</div>
          <h2 className="mt-2 text-[22px] font-extrabold">Efficacité électrique</h2>
          <p className="mt-2 text-[14px] text-slate-600">Toute la salle divisée par l’électricité des machines. 1,00 = rien ne se perd.</p>
        </a>
        <a href={`/${locale}/outils/wue`} className="block bg-white border rounded-2xl p-6 hover:border-[#0176D3]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">WUE</div>
          <h2 className="mt-2 text-[22px] font-extrabold">Efficacité eau</h2>
          <p className="mt-2 text-[14px] text-slate-600">Litres d’eau de la salle par kWh des machines. Même période que l’électricité.</p>
        </a>
        <a href={`/${locale}/maturite`} className="md:col-span-2 block bg-white border rounded-2xl p-6 hover:border-[#0176D3]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">Diagnostic</div>
          <h2 className="mt-2 text-[22px] font-extrabold">Maturité de la salle</h2>
          <p className="mt-2 text-[14px] text-slate-600">Huit questions, y compris le dossier européen à venir.</p>
        </a>
      </main>
    </div>
  );
}
