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
          <span className="hidden md:block opacity-70">Conçu pour les datacenters européens exigeants</span>
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
          <div className="flex items-center gap-3">
            <a href="#produit" className="hidden md:inline-flex text-[13px] font-medium text-slate-600 px-3 py-2">Produit</a>
            <a href="#comment" className="hidden md:inline-flex text-[13px] font-medium text-slate-600 px-3 py-2">Comment ça marche</a>
            <a href={plateforme} className="hidden md:inline-flex text-[13px] font-medium text-slate-600 px-3 py-2">Plateforme</a>
            <a href={demo} className="inline-flex items-center gap-2 bg-[#0176D3] hover:bg-[#032D60] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full">Demander une démo live <Arrow /></a>
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
              <a href={demo} className="inline-flex items-center gap-2 bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Demander une démo live <Arrow /></a>
              <a href={plateforme} className="inline-flex items-center gap-2 bg-white border border-slate-200 px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir le produit</a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-[12px] text-slate-500">
              <span>Données chez vous</span>
              <span>Sans agent lourd</span>
              <a href={eed} className="underline">EU 2024/1364 — preview</a>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_20px_60px_rgba(3,45,96,0.12)] overflow-hidden">
              <div className="h-10 bg-[#F8FAFC] border-b border-slate-100 flex items-center gap-1.5 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] text-slate-400">qinode.eu / pilotage</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {[{k:'Capacité libre',v:'42%',c:'text-emerald-600 bg-emerald-50'},{k:'PUE preview',v:'1.07',c:'text-[#0176D3] bg-[#0176D3]/10'},{k:'Risque panne',v:'Faible',c:'text-slate-700 bg-slate-100'}].map((e)=>(
                  <div key={e.k} className={`rounded-xl p-3 border border-slate-100 ${e.c}`}>
                    <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70">{e.k}</div>
                    <div className="text-[22px] font-extrabold mt-1">{e.v}</div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-xl bg-gradient-to-br from-[#032D60] to-[#0176D3] p-4 text-white">
                  <div className="text-[11px] uppercase tracking-widest opacity-70">Jumeau numérique</div>
                  <div className="mt-1 text-[14px] font-semibold">Salle B • 24 racks • cartographiés</div>
                  <div className="mt-3 flex gap-2 text-[11px]">
                    <span className="bg-white/15 px-2.5 py-1 rounded-full">Élec: OK</span>
                    <span className="bg-white/15 px-2.5 py-1 rounded-full">Froid: 22°C</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between bg-[#F8FAFC] border border-slate-100 rounded-xl p-3 text-[12px]">
                  <span>Inventaire mis à jour il y a 3 minutes</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-full">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
          <h2 className="text-[30px] md:text-[40px] font-extrabold tracking-tight leading-[1.05]">Le problème que tout le monde connaît.</h2>
          <p className="mt-4 text-[16px] text-slate-600">Vous n&apos;avez pas besoin d&apos;un outil de plus. Vous avez besoin de savoir.</p>
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {[
              ['On ne sait plus ce qui est branché où', 'Des feuilles Excel, des plans obsolètes. Chaque intervention devient une chasse au trésor.'],
              ['On découvre la panne trop tard', 'Pas de vue d’ensemble de la chaîne électrique. Un disjoncteur saute, tout le monde cherche.'],
              ['Le reporting UE prend 3 semaines', 'PUE, WUE, chaleur fatale… plus de temps à prouver qu’à piloter.']
            ].map(([t,d]) => (
              <div key={t} className="bg-white border border-slate-200 rounded-[1.25rem] p-6">
                <h3 className="text-[17px] font-bold">{t}</h3>
                <p className="mt-2.5 text-[14px] leading-6 text-slate-600">{d}</p>
                <div className="mt-5 text-[12px] font-semibold text-[#0176D3]">C&apos;est fini →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="produit" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-[30px] md:text-[42px] font-extrabold tracking-tight leading-[0.95]">Ce que vous voyez<br />avec Qinode.</h2>
        <p className="mt-4 text-[15px] text-slate-600 max-w-[44ch]">Pas de jargon. Juste ce qu&apos;il faut piloter au quotidien, dans une seule interface.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            ['Tout votre inventaire à jour', 'Serveurs, baies, câbles, ports. Fini la saisie manuelle.'],
            ['Toute la chaîne électrique', 'Du compteur à la batterie. Vous savez où part chaque kilowatt.'],
            ['Le refroidissement sous contrôle', 'Débit, pression, fuites, températures.'],
            ['Des capacités réelles', 'Place, puissance, froid — ce qu’il reste pour le prochain client.'],
            ['Un jumeau 3D dans le navigateur', 'Chaleur, élec, flux. Sans rien installer.'],
            ['Des preuves prêtes pour l’audit', 'PUE / WUE en preview. Export pour une revue humaine.']
          ].map(([t,d]) => (
            <div key={t} className="bg-white border border-slate-200 rounded-[1.25rem] p-6">
              <h3 className="text-[16px] font-bold">{t}</h3>
              <p className="mt-2 text-[14px] leading-6 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-br from-[#032D60] to-[#0A4A9A] rounded-[1.45rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <div className="font-semibold">Voir le produit</div>
            <div className="text-[13px] opacity-70">Interface réelle, pas de slides.</div>
          </div>
          <a href={plateforme} className="bg-white text-[#032D60] px-5 py-2.5 rounded-full text-[13px] font-semibold">Ouvrir la plateforme</a>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16">
          <h2 className="text-[28px] md:text-[36px] font-extrabold">Pour qui ?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {[
              ['Directeur datacenter', 'Une vision claire. Décider avec des faits.', ['Risque panne visible','Capacité vendable connue','Budget justifié']],
              ['Responsable exploitation', 'Moins de chasse au câble. Plus d’anticipation.', ['Intervention ciblée','Inventaire à jour','Alerte avant la panne']],
              ['RSE / Conformité', 'Un dossier prêt pour revue, pas un Excel de 15 onglets.', ['PUE/WUE tracés','Preuves auditables','Export preview']]
            ].map(([role, gain, points]) => (
              <div key={String(role)} className="bg-[#F8FAFC] border border-slate-200 rounded-[1.25rem] p-6">
                <div className="font-bold">{role}</div>
                <p className="mt-4 text-[14px] leading-6 text-slate-700 font-medium">{gain}</p>
                <div className="mt-4 space-y-2">
                  {(points as string[]).map((n) => <div key={n} className="flex items-center gap-2 text-[13px] text-slate-600"><Check />{n}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comment" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-[28px] md:text-[40px] font-extrabold leading-[0.95]">Comment ça marche ?<br />En 3 étapes.</h2>
        <p className="mt-4 text-[15px] text-slate-600">Qinode se branche, relie, et vous pilotez.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {[
            ['1', 'Connexion à ce que vous avez', 'PDU, onduleurs, climatisation, serveurs. Sans agent lourd.'],
            ['2', 'Une source de vérité', 'Quoi, où, branché à quoi, qui consomme quoi.'],
            ['3', 'Une seule interface', 'Inventaire, élec, froid, capacité, 3D, conformité.']
          ].map(([n,t,d]) => (
            <div key={n}>
              <div className="w-16 h-16 rounded-[1.1rem] bg-[#032D60] text-white grid place-items-center text-[22px] font-bold">{n}</div>
              <h3 className="mt-6 text-[17px] font-bold">{t}</h3>
              <p className="mt-2 text-[14px] leading-6 text-slate-600">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-semibold">Conçu pour les datacenters européens exigeants</div>
          <div className="flex flex-wrap gap-3 text-[12px]">
            <span className="bg-white/10 px-3 py-1.5 rounded-full">Souverain</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">On-premise</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-full">Sans cloud obligatoire</span>
            <a href={eed} className="bg-[#0176D3] px-3 py-1.5 rounded-full font-semibold">EU 2024/1364</a>
          </div>
        </div>
      </section>

      <section id="demo" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <div className="rounded-[1.75rem] bg-[#F3F8FF] border border-[#DDEBFF] p-8 md:p-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <div>
            <h2 className="text-[32px] md:text-[44px] font-extrabold leading-[0.95]">On vous montre ?<br />Une démo live.</h2>
            <p className="mt-4 text-[15px] leading-6 text-slate-600 max-w-[48ch]">20 minutes, votre cas d&apos;usage. Contrôle en quelques jours, pas en quelques mois.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={demo} className="inline-flex items-center gap-2 bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Demander une démo live</a>
              <a href={plateforme} className="inline-flex items-center gap-2 bg-white border px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir la plateforme</a>
            </div>
            <p className="mt-6 text-[12px] text-slate-500">Réponse en 24h • Sans engagement • Hébergé en France</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.25rem] p-6">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">Ce que vous allez voir</div>
            <div className="mt-4 space-y-3">
              {['Inventaire cartographié','Chaîne électrique de A à Z','Jumeau 3D navigable','Rapport UE en preview'].map((e)=>(
                <div key={e} className="flex gap-3 text-[14px] font-medium"><Check />{e}</div>
              ))}
            </div>
            <div className="mt-6 p-3 rounded-xl bg-[#F8FAFC] border text-[12px] text-slate-600">
              <span className="font-semibold text-slate-800">Léon, Directeur DC – Lille</span><br />
              « On a arrêté Excel le premier jour. Enfin on sait ce qu’on a. »
            </div>
            <div className="mt-4 flex gap-3 text-[13px]">
              <a href={power} className="underline">Supervision énergie</a>
              <a href={eed} className="underline">Module EED</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#032D60] text-white font-extrabold grid place-items-center">Q</div>
            <div>
              <div className="font-bold">QINODE.EU</div>
              <div className="text-[12px] text-slate-500 mt-1 leading-5">677 Avenue de la République, Lille — France<br />Plateforme DCIM souveraine, on-premise.</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 leading-6">
            <div>© Qinode.eu — Datacenter sous contrôle. Enfin.</div>
            <div>contact@qinode.eu • <a className="underline" href={plateforme}>Plateforme</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
