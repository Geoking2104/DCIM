export default function MarketingHome({ locale }: { locale: string }) {
  const plateforme = `/${locale}/plateforme`;
  const eed = `/${locale}/eed`;
  const power = `/${locale}/power`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  const Check = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
  );
  const Arrow = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );

  const classes = [
    { l: 'A', t: '≤ 1.15', c: 'bg-emerald-500' },
    { l: 'B', t: '1.25', c: 'bg-lime-500' },
    { l: 'C', t: '1.35', c: 'bg-yellow-400' },
    { l: 'D', t: '1.50', c: 'bg-amber-400' },
    { l: 'E', t: '1.75', c: 'bg-orange-500' },
    { l: 'F', t: '2.00', c: 'bg-red-500' },
    { l: 'G', t: '> 2.0', c: 'bg-red-800' }
  ];

  const shots = [
    {
      src: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
      cap: 'Salle — source métrologie PUE / WUE'
    },
    {
      src: 'https://images.unsplash.com/photo-1544197150-b99a5804f8b4?auto=format&fit=crop&w=1200&q=80',
      cap: 'Baies — charge IT pour le calcul Annexe III'
    },
    {
      src: '/images/img-1.svg',
      cap: 'Boucle froid — entrée ERF / chaleur fatale'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <div className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-8 flex items-center justify-between text-[11px]">
          <span className="opacity-90">Souverain • On-premise • Sans cloud obligatoire</span>
          <a href={eed} className="underline opacity-90">Module EED →</a>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <a href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#032D60] text-white font-extrabold grid place-items-center">Q</div>
            <div>
              <div className="font-extrabold text-[17px] leading-none">QINODE<span className="text-[#0176D3]">.EU</span></div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-0.5">Datacenter sous contrôle</div>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <a href={plateforme} className="hidden md:inline-flex text-[13px] font-semibold text-[#032D60] px-3 py-2">Plateforme</a>
            <a href={eed} className="inline-flex text-[13px] font-semibold text-[#0176D3] px-3 py-2 underline underline-offset-4">EED</a>
            <a href={demo} className="inline-flex items-center gap-2 bg-[#0176D3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full">Demander une démo</a>
          </div>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-16 md:pt-24 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border border-slate-200 rounded-full px-3.5 py-1.5 text-[11px] font-semibold mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> PLATEFORME DCIM EUROPÉENNE
            </div>
            <h1 className="text-[42px] md:text-[64px] font-extrabold tracking-tight leading-[0.9]">
              Votre datacenter<br />sous contrôle.<br /><span className="text-[#0176D3]">Enfin.</span>
            </h1>
            <p className="mt-6 text-[18px] md:text-[20px] leading-[1.4] text-slate-600 max-w-[48ch] font-medium">
              Qinode dit ce que vous avez, ce que vous consommez, et ce qu'il reste — y compris le dossier énergie européen.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={plateforme} className="inline-flex items-center gap-2 bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir la plateforme <Arrow /></a>
              <a href={eed} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-7 py-3.5 rounded-full text-[15px] font-semibold">Ouvrir le module EED</a>
            </div>
          </div>
          <a href={eed} className="block bg-white border rounded-[1.5rem] shadow-[0_20px_60px_rgba(3,45,96,0.12)] overflow-hidden">
            <div className="h-10 bg-[#F8FAFC] border-b flex items-center px-4 text-[11px] text-slate-400">qinode.eu / eed — preview A–G</div>
            <img src={shots[0].src} alt="Salle datacenter" className="h-40 w-full object-cover" />
            <div className="p-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl p-3 bg-emerald-50 text-emerald-700"><div className="text-[10px] uppercase">PUE</div><div className="text-[22px] font-extrabold">1.07</div></div>
              <div className="rounded-xl p-3 bg-[#0176D3]/10 text-[#0176D3]"><div className="text-[10px] uppercase">Classe</div><div className="text-[22px] font-extrabold">A</div></div>
              <div className="rounded-xl p-3 bg-slate-100"><div className="text-[10px] uppercase">ERF</div><div className="text-[22px] font-extrabold">12%</div></div>
            </div>
          </a>
        </div>
      </section>

      <section id="eed" className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-20">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-blue-200 font-semibold">Règlement délégué (UE) 2024/1364</div>
              <h2 className="mt-3 text-[32px] md:text-[44px] font-extrabold leading-[0.95]">Conformité EED,<br />sans tableur de 3 semaines.</h2>
              <p className="mt-5 text-[16px] leading-7 text-blue-100 max-w-[52ch]">
                Captures du module : salle, baies, boucle froid — puis le tableau A–G. Preview interne, pas le label UE officiel.
              </p>
              <a href={eed} className="mt-8 inline-flex items-center gap-2 bg-white text-[#032D60] px-7 py-3.5 rounded-full text-[15px] font-semibold">
                Ouvrir /fr/eed <Arrow />
              </a>
            </div>
            <div className="bg-white text-[#032D60] rounded-[1.5rem] p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-widest text-slate-400">Capture tableau de bord</div>
                  <div className="text-[18px] font-bold mt-1">Paris East • classe A preview</div>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white grid place-items-center text-[28px] font-black">A</div>
              </div>
              <div className="mt-6 space-y-1.5">
                {classes.map((row) => (
                  <div key={row.l} className="flex items-center gap-3 text-[12px] font-mono">
                    <span className={`w-8 text-center text-white text-[11px] font-bold py-0.5 ${row.c}`}>{row.l}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded">
                      <div className={`h-2 ${row.c} rounded`} style={{ width: row.l === 'A' ? '88%' : '40%' }} />
                    </div>
                    <span className="w-14 text-right text-slate-500">PUE {row.t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-4">
            {shots.map((s) => (
              <a key={s.cap} href={eed} className="block rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                <img src={s.src} alt={s.cap} className="h-44 w-full object-cover" />
                <div className="px-3 py-2 text-[12px] text-blue-100">{s.cap}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] border-y">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          <h2 className="text-[30px] md:text-[40px] font-extrabold">Le problème que tout le monde connaît.</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <a href={plateforme} className="bg-white border rounded-[1.25rem] p-6 block"><h3 className="font-bold">On ne sait plus ce qui est branché où</h3><p className="mt-2 text-[14px] text-slate-600">Excel et plans obsolètes.</p></a>
            <a href={power} className="bg-white border rounded-[1.25rem] p-6 block"><h3 className="font-bold">On découvre la panne trop tard</h3><p className="mt-2 text-[14px] text-slate-600">Pas de vue de la chaîne électrique.</p></a>
            <a href={eed} className="bg-white border border-[#0176D3] rounded-[1.25rem] p-6 block"><h3 className="font-bold">Le reporting UE prend 3 semaines</h3><p className="mt-2 text-[14px] text-slate-600">Le module EED assemble PUE, WUE, ERF.</p></a>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-[1200px] mx-auto px-6 py-10 flex flex-wrap justify-between gap-4 text-[13px]">
          <span className="font-bold">QINODE.EU</span>
          <a className="underline font-semibold" href={eed}>EED /fr/eed</a>
        </div>
      </footer>
    </div>
  );
}
