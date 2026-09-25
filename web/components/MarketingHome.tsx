export default function MarketingHome({ locale }: { locale: string }) {
  const plateforme = `/${locale}/plateforme`;
  const eed = `/${locale}/modules/conformite-eed`;
  const power = `/${locale}/power`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  const Check = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7" /></svg>
  );
  const Arrow = () => (
    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <div className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-8 flex items-center justify-between text-[11px]">
          <span className="opacity-90">Souverain • On-premise • Sans cloud obligatoire</span>
          <a href={plateforme} className="underline opacity-90">Ouvrir la plateforme →</a>
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
            <a href="#produit" className="hidden md:inline-flex text-[13px] font-medium text-slate-600 px-3 py-2">Produit</a>
            <a href={plateforme} className="inline-flex text-[13px] font-semibold text-[#032D60] px-3 py-2 underline underline-offset-4">Plateforme</a>
            <a href={eed} className="hidden md:inline-flex text-[13px] font-medium text-slate-600 px-3 py-2">EED</a>
            <a href={demo} className="inline-flex items-center gap-2 bg-[#0176D3] hover:bg-[#032D60] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full">Demander une démo</a>
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
              Qinode est la plateforme qui vous dit exactement ce que vous avez, ce que vous consommez, et ce qu&apos;il vous reste.
            </p>
            <div className="mt-8 space-y-3.5">
              {['Réduisez vos risques de panne', 'Gagnez du temps d’exploitation', 'Préparez le reporting UE sans chaos'].map((e) => (
                <div key={e} className="flex items-center gap-3 text-[15px] font-medium">
                  <div className="w-7 h-7 rounded-full bg-[#0176D3]/10 text-[#0176D3] grid place-items-center"><Check /></div>
                  {e}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href={plateforme} className="inline-flex items-center gap-2 bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir la plateforme <Arrow /></a>
              <a href={demo} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-7 py-3.5 rounded-full text-[15px] font-semibold">Demander une démo live</a>
            </div>
          </div>

          <a href={plateforme} className="relative block">
            <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_20px_60px_rgba(3,45,96,0.12)] overflow-hidden">
              <div className="h-10 bg-[#F8FAFC] border-b border-slate-100 flex items-center gap-1.5 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] text-slate-400">qinode.eu / plateforme</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {[{k:'Capacité libre',v:'42%',c:'text-emerald-600 bg-emerald-50'},{k:'PUE preview',v:'1.07',c:'text-[#0176D3] bg-[#0176D3]/10'},{k:'Risque panne',v:'Faible',c:'text-slate-700 bg-slate-100'}].map((e)=>(
                  <div key={e.k} className={`rounded-xl p-3 border border-slate-100 ${e.c}`}>
                    <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70">{e.k}</div>
                    <div className="text-[22px] font-extrabold mt-1">{e.v}</div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5 text-[12px] font-semibold text-[#0176D3]">Ouvrir la plateforme →</div>
            </div>
          </a>
        </div>
      </section>

      <section className="bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          <h2 className="text-[30px] md:text-[40px] font-extrabold">Le problème que tout le monde connaît.</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              ['On ne sait plus ce qui est branché où', 'Des feuilles Excel, des plans obsolètes.'],
              ['On découvre la panne trop tard', 'Pas de vue d’ensemble de la chaîne électrique.'],
              ['Le reporting UE prend 3 semaines', 'Plus de temps à prouver qu’à piloter.']
            ].map(([t,d]) => (
              <a key={t} href={plateforme} className="bg-white border border-slate-200 rounded-[1.25rem] p-6 block hover:border-[#0176D3]">
                <h3 className="text-[17px] font-bold">{t}</h3>
                <p className="mt-2.5 text-[14px] text-slate-600">{d}</p>
                <div className="mt-5 text-[12px] font-semibold text-[#0176D3]">Voir la plateforme →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="produit" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        <h2 className="text-[30px] md:text-[42px] font-extrabold">Ce que vous voyez avec Qinode.</h2>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            ['Inventaire à jour', 'Serveurs, baies, câbles, ports.'],
            ['Chaîne électrique', 'Du compteur à la batterie.'],
            ['Refroidissement', 'Débit, pression, fuites, températures.'],
            ['Capacités réelles', 'Place, puissance, froid.'],
            ['Jumeau 3D', 'Dans le navigateur, sans install.'],
            ['Preuves d’audit', 'PUE / WUE en preview.']
          ].map(([t,d]) => (
            <a key={t} href={plateforme} className="bg-white border border-slate-200 rounded-[1.25rem] p-6 block hover:border-[#0176D3]">
              <h3 className="text-[16px] font-bold">{t}</h3>
              <p className="mt-2 text-[14px] text-slate-600">{d}</p>
            </a>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-br from-[#032D60] to-[#0A4A9A] rounded-[1.45rem] p-6 md:p-8 flex items-center justify-between gap-6 text-white">
          <div>
            <div className="font-semibold">Interface réelle</div>
            <div className="text-[13px] opacity-70">KPI, racks, jumeau, conformité.</div>
          </div>
          <a href={plateforme} className="bg-white text-[#032D60] px-5 py-2.5 rounded-full text-[13px] font-semibold">Ouvrir la plateforme</a>
        </div>
      </section>

      <section id="demo" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
        <div className="rounded-[1.75rem] bg-[#F3F8FF] border border-[#DDEBFF] p-8 md:p-12">
          <h2 className="text-[32px] md:text-[44px] font-extrabold">On vous montre ?</h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={plateforme} className="inline-flex items-center gap-2 bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir la plateforme <Arrow /></a>
            <a href={demo} className="inline-flex items-center gap-2 bg-white border px-7 py-3.5 rounded-full text-[15px] font-semibold">Demander une démo live</a>
            <a href={power} className="inline-flex items-center px-7 py-3.5 text-[15px] underline">Supervision énergie</a>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10 flex flex-wrap justify-between gap-4 text-[13px]">
          <span className="font-bold">QINODE.EU</span>
          <div className="flex gap-4">
            <a className="underline font-semibold" href={plateforme}>Plateforme</a>
            <a className="underline" href={eed}>EED</a>
            <a className="underline" href={power}>Énergie</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
