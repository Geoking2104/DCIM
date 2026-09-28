'use client';

const PAIN = [
  { title: 'On ne sait plus ce qui est branché où', desc: 'Des feuilles Excel, des plans obsolètes. Chaque intervention devient une chasse au trésor.' },
  { title: 'On découvre la panne quand c’est trop tard', desc: 'Pas de vue d’ensemble de la chaîne électrique. Un disjoncteur saute, et tout le monde cherche.' },
  { title: 'Le reporting EU prend 3 semaines', desc: 'PUE, WUE, chaleur fatale… Vous passez plus de temps à prouver qu’à optimiser.' }
];

const PRODUCT = [
  { title: 'Tout votre inventaire à jour, automatiquement', desc: 'Serveurs, baies, câbles, ports. Qinode détecte tout seul. Fini la saisie manuelle.' },
  { title: 'Toute votre chaîne électrique, du compteur à la batterie', desc: 'Du général jusqu’à la cellule. Vous savez où part chaque kilowatt, et ce qui risque de lâcher.' },
  { title: 'Votre refroidissement liquide sous contrôle', desc: 'Débit, pression, fuites, températures. Vous pilotez le froid comme vous pilotez l’élec.' },
  { title: 'Vos capacités réelles, pas estimées', desc: 'Place, puissance, froid. Vous savez exactement ce qu’il vous reste pour le prochain client.' },
  { title: 'Votre jumeau numérique 3D, dans le navigateur', desc: 'Votre datacenter en 3D, avec la chaleur, l’élec, les flux. Sans installer quoi que ce soit.' },
  { title: 'Vos preuves de durabilité, prêtes pour l’audit', desc: 'PUE, WUE, chaleur réutilisée. Exportable en un clic pour la conformité européenne.' }
];

const ROLES = [
  { role: 'Directeur datacenter', gain: 'Vous avez enfin une vision claire. Vous décidez avec des faits, pas avec des suppositions.', points: ['Risque panne divisé', 'Capacité vendable connue', 'Budget justifié'] },
  { role: 'Responsable exploitation', gain: 'Vous gagnez une demi-journée par semaine. Plus de chasse au câble, plus de doute.', points: ['Intervention en 2 minutes', 'Inventaire toujours juste', 'Alerte avant la panne'] },
  { role: 'Responsable RSE / Conformité', gain: 'Votre reporting EU est prêt. Sans Excel de 15 onglets et sans panique de dernière minute.', points: ['PUE / WUE tracés', 'Preuves auditables', 'Export 1 clic'] }
];

const STEPS = [
  { n: '1', title: 'Qinode se connecte à vos équipements', desc: 'PDU, onduleurs, climatisation, serveurs. Sans agent lourd. Il écoute ce que vous avez déjà.' },
  { n: '2', title: 'Il construit votre source de vérité', desc: 'Tout est relié : quoi, où, branché à quoi, qui consomme quoi. Plus de zone grise.' },
  { n: '3', title: 'Vous pilotez depuis une seule interface', desc: 'Inventaire, élec, froid, capacité, 3D, conformité. Tout est là. Clair, à jour, actionnable.' }
];

const EED_PROCESS = [
  { step: '01 Capteurs', hardware: 'Compteurs bâtiment · PDU rack · sondes T/φ · CDU / CRAH · onduleurs', output: 'Télémétrie 10 s, 24/24', kpi: 'kWh, L, °C, ΔP' },
  { step: '02 Stack', hardware: 'Edge collectors → bus événements → ClickHouse + graphe CSoT', output: 'Séries horodatées + topologie', kpi: 'Qualité de donnée' },
  { step: '03 Moteur', hardware: 'Règles versionnées PUE / WUE / ERF / REF · Art. 26 chaleur', output: 'KPI officiels, pas un tableur', kpi: 'EDC / EIT / WIN / ER' },
  { step: '04 Preuve', hardware: 'Snapshot immuable + revue 4 yeux + export UE / national', output: 'Dossier 15 mai, prêt audit', kpi: 'Reçu + QR label' }
];

export default function MarketingHome({ locale }: { locale: string }) {
  const app = `/${locale}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-[#0176D3]/20">
      <div className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-8 flex items-center justify-between text-[11px] tracking-wide">
          <span className="flex items-center gap-2 font-medium opacity-90">Souverain • On-premise • Sans cloud obligatoire</span>
          <span className="hidden md:flex items-center gap-2 opacity-70">Conçu pour les datacenters européens exigeants</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <a href={app} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#032D60] flex items-center justify-center text-white font-extrabold text-[16px]">Q</div>
            <div>
              <div className="font-extrabold text-[17px] tracking-tight leading-none">
                QINODE<span className="text-[#0176D3]">.EU</span>
              </div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-0.5">Datacenter sous contrôle</div>
            </div>
          </a>
          <nav className="flex items-center gap-3">
            <a href="#produit" className="hidden md:inline-flex text-[13px] font-medium text-slate-600 hover:text-[#032D60] px-3 py-2">Produit</a>
            <a href="#eed" className="hidden md:inline-flex text-[13px] font-medium text-slate-600 hover:text-[#032D60] px-3 py-2">Process EED</a>
            <a href={`/${locale}/jumeau`} className="hidden md:inline-flex text-[13px] font-medium text-slate-600 hover:text-[#032D60] px-3 py-2">Jumeau 3D</a>
            <a href="#demo" className="inline-flex items-center gap-2 bg-[#0176D3] hover:bg-[#032D60] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition">
              Demander une démo live
            </a>
          </nav>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 pt-16 md:pt-24 pb-16 md:pb-24">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border border-slate-200 rounded-full px-3.5 py-1.5 text-[11px] font-semibold tracking-wide text-[#032D60] mb-6">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              PLATEFORME DCIM EUROPÉENNE
            </div>
            <h1 className="text-[42px] md:text-[64px] font-extrabold tracking-tight leading-[0.9] text-[#032D60]">
              Votre datacenter
              <br />sous contrôle.
              <br />
              <span className="text-[#0176D3]">Enfin.</span>
            </h1>
            <p className="mt-6 text-[18px] md:text-[20px] leading-[1.4] text-slate-600 max-w-[48ch] font-medium">
              Qinode est la plateforme qui vous dit exactement ce que vous avez, ce que vous consommez, et ce qu’il vous reste.
            </p>
            <div className="mt-8 space-y-3.5">
              {['Réduisez vos risques de panne', 'Gagnez 30% de temps d’exploitation', 'Soyez conforme EU sans effort'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-[15px] font-medium text-slate-800">
                  <div className="w-7 h-7 rounded-full bg-[#0176D3]/10 text-[#0176D3] flex items-center justify-center text-[13px] font-bold">✓</div>
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#demo" className="inline-flex items-center bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-black transition shadow-[0_8px_24px_rgba(3,45,96,0.25)]">
                Demander une démo live
              </a>
              <a href={`/${locale}/jumeau`} className="inline-flex items-center bg-white border border-slate-200 px-7 py-3.5 rounded-full text-[15px] font-semibold hover:border-[#032D60] transition">
                Voir le jumeau 3D
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-[12px] text-slate-500">
              <span>Données chez vous</span>
              <span>Sans agent lourd</span>
              <span>EU 2024/1364 ready</span>
              <span>Suivi 24/24</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-[#0176D3]/20 via-[#032D60]/10 to-transparent rounded-[2.5rem] blur-[12px]" />
            <div className="relative bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_20px_60px_rgba(3,45,96,0.12)] overflow-hidden">
              <div className="h-10 bg-[#F8FAFC] border-b border-slate-100 flex items-center gap-1.5 px-4">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-[11px] font-mono text-slate-400">qinode.eu / pilotage / 24-24</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {[
                  { k: 'Capacité libre', v: '42%', c: 'text-emerald-600 bg-emerald-50' },
                  { k: 'PUE temps réel', v: '1.28', c: 'text-[#0176D3] bg-[#0176D3]/10' },
                  { k: 'Risque panne', v: 'Faible', c: 'text-slate-700 bg-slate-100' }
                ].map((card) => (
                  <div key={card.k} className={`rounded-xl p-3 border border-slate-100 ${card.c}`}>
                    <div className="text-[10px] uppercase tracking-widest font-semibold opacity-70">{card.k}</div>
                    <div className="text-[22px] font-extrabold mt-1 tracking-tight">{card.v}</div>
                    <div className="mt-2 h-1.5 bg-white/70 rounded-full overflow-hidden">
                      <div className="h-full bg-current w-[68%] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 pb-5">
                <div className="rounded-xl bg-gradient-to-br from-[#032D60] to-[#0176D3] p-4 text-white relative overflow-hidden">
                  <div className="relative flex justify-between">
                    <div>
                      <div className="text-[11px] uppercase tracking-widest opacity-70">Jumeau numérique</div>
                      <div className="mt-1 text-[14px] font-semibold">Salle B • 24 racks • 100% cartographiés</div>
                      <div className="mt-3 flex gap-2">
                        <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px]">Élec: OK</span>
                        <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px]">Froid: 22°C</span>
                        <span className="bg-white/15 px-2.5 py-1 rounded-full text-[11px]">EED live</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-[1fr_auto] gap-3 items-center bg-[#F8FAFC] border border-slate-100 rounded-xl p-3">
                  <div className="text-[12px] font-medium text-slate-700">Inventaire + PUE mis à jour il y a 12 s • automatique</div>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-1 rounded-full">LIVE 24/24</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="eed" className="bg-[#F8FAFC] border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-[64ch]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0176D3]">EED comme process, pas comme tableur</p>
            <h2 className="mt-3 text-[30px] md:text-[40px] font-extrabold tracking-tight text-[#032D60] leading-[1.05]">
              La conformité EU sort du stack hardware, 24 heures sur 24.
            </h2>
            <p className="mt-4 text-[16px] leading-6 text-slate-600">
              Directive 2023/1791 et règlement délégué 2024/1364 ne sont pas un rapport annuel bricolé en mai.
              Qinode les calcule en continu à partir des compteurs, PDU, CDU et sondes déjà en salle.
            </p>
          </div>
          <div className="mt-10 grid md:grid-cols-4 gap-4">
            {EED_PROCESS.map((item) => (
              <div key={item.step} className="bg-white border border-slate-200 rounded-[1.25rem] p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">{item.step}</div>
                <div className="mt-3 text-[13px] font-semibold text-[#032D60] leading-5">{item.hardware}</div>
                <div className="mt-3 text-[13px] text-slate-600">{item.output}</div>
                <div className="mt-4 text-[11px] font-mono bg-[#F3F8FF] text-[#032D60] px-2 py-1 rounded">{item.kpi}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 grid md:grid-cols-4 gap-3 text-[12px] font-mono">
            {[
              { k: 'PUE', v: 'EDC / EIT', n: 'Énergie totale / IT' },
              { k: 'WUE', v: 'WIN / EIT', n: 'Eau entrante / IT' },
              { k: 'ERF', v: 'ER / EDC', n: 'Chaleur réutilisée' },
              { k: 'REF', v: 'Renouv. / EIT', n: 'Part renouvelable' }
            ].map((kpi) => (
              <div key={kpi.k} className="border border-slate-200 bg-white rounded-xl p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-400">{kpi.k}</div>
                <div className="mt-1 text-[16px] font-bold text-[#032D60]">{kpi.v}</div>
                <div className="mt-1 text-[11px] text-slate-500">{kpi.n}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`/${locale}/eed`} className="inline-flex items-center bg-[#032D60] text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">Ouvrir le dossier EED</a>
            <a href={`/${locale}/supervision`} className="inline-flex items-center bg-white border border-slate-200 px-5 py-2.5 rounded-full text-[13px] font-semibold">Supervision 24/24</a>
            <a href={`/${locale}/power`} className="inline-flex items-center bg-white border border-slate-200 px-5 py-2.5 rounded-full text-[13px] font-semibold">Chaîne électrique</a>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-[30px] md:text-[40px] font-extrabold tracking-tight text-[#032D60] leading-[1.05]">Le problème que tout le monde connaît.</h2>
        <p className="mt-4 text-[16px] leading-6 text-slate-600">Vous n’avez pas besoin d’un outil de plus. Vous avez besoin de savoir.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {PAIN.map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-[1.25rem] p-6">
              <h3 className="text-[17px] font-bold tracking-tight text-[#032D60] leading-[1.2]">{item.title}</h3>
              <p className="mt-2.5 text-[14px] leading-6 text-slate-600">{item.desc}</p>
              <div className="mt-5 text-[12px] font-semibold text-[#0176D3]">C’est fini</div>
            </div>
          ))}
        </div>
      </section>

      <section id="produit" className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-16 md:pb-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-[30px] md:text-[42px] font-extrabold tracking-tight text-[#032D60] leading-[0.95]">
            Ce que vous voyez<br />avec Qinode.
          </h2>
          <p className="text-[15px] leading-6 text-slate-600 max-w-[44ch]">Pas de jargon. Juste ce que vous avez besoin de piloter au quotidien, dans une seule interface.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PRODUCT.map((item) => (
            <div key={item.title} className="bg-white border border-slate-200 rounded-[1.25rem] p-6 hover:border-[#0176D3]/30 hover:shadow-[0_16px_40px_rgba(1,118,211,0.08)] transition-all">
              <h3 className="text-[16px] font-bold tracking-tight text-[#032D60] leading-[1.25]">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-gradient-to-br from-[#032D60] to-[#0A4A9A] rounded-[1.5rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div>
            <div className="font-semibold">Voir le produit en 2 minutes</div>
            <div className="text-[13px] opacity-70">Interface réelle, pas de slides. Pilotage + process EED branché sur le hardware.</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href={`/${locale}/plateforme`} className="shrink-0 bg-white text-[#032D60] px-5 py-2.5 rounded-full text-[13px] font-semibold">Ouvrir la plateforme</a>
            <a href={`/${locale}/jumeau`} className="shrink-0 bg-white/10 border border-white/20 text-white px-5 py-2.5 rounded-full text-[13px] font-semibold">Jumeau 3D</a>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-20">
          <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#032D60]">Pour qui ?</h2>
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            {ROLES.map((item) => (
              <div key={item.role} className="bg-[#F8FAFC] border border-slate-200 rounded-[1.25rem] p-6">
                <div className="font-bold text-[#032D60]">{item.role}</div>
                <p className="mt-4 text-[14px] leading-6 text-slate-700 font-medium">{item.gain}</p>
                <div className="mt-4 space-y-2">
                  {item.points.map((point) => (
                    <div key={point} className="flex items-center gap-2 text-[13px] text-slate-600">
                      <span className="text-emerald-600">✓</span>{point}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="comment" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <h2 className="text-[28px] md:text-[40px] font-extrabold tracking-tight leading-[0.95] text-[#032D60]">Comment ça marche ?<br />En 3 étapes.</h2>
        <p className="mt-4 text-[15px] text-slate-600 max-w-[48ch]">Pas de projet à rallonge. Qinode se branche, comprend, et vous pilotez.</p>
        <div className="mt-12 grid md:grid-cols-3 gap-8">
          {STEPS.map((item) => (
            <div key={item.n}>
              <div className="w-16 h-16 rounded-[1.1rem] bg-[#032D60] text-white grid place-items-center text-[22px] font-bold">{item.n}</div>
              <h3 className="mt-6 text-[17px] font-bold tracking-tight text-[#032D60] leading-[1.25]">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-6 text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-semibold tracking-tight">Conçu pour les datacenters européens exigeants</div>
          <div className="flex flex-wrap items-center gap-3 text-[12px]">
            <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">Souverain</span>
            <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">On-premise</span>
            <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">Sans cloud obligatoire</span>
            <span className="bg-[#0176D3] px-3 py-1.5 rounded-full font-semibold">EU 2024/1364 ready</span>
            <span className="bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">Suivi 24/24</span>
          </div>
        </div>
      </section>

      <section id="demo" className="max-w-[1200px] mx-auto px-6 lg:px-8 py-16 md:py-24">
        <div className="rounded-[1.75rem] bg-[#F3F8FF] border border-[#DDEBFF] p-8 md:p-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div>
            <h2 className="text-[32px] md:text-[44px] font-extrabold tracking-tight leading-[0.95] text-[#032D60]">On vous montre ?<br />Pas de discours, une démo live.</h2>
            <p className="mt-4 text-[15px] leading-6 text-slate-600 max-w-[48ch]">20 minutes, votre cas d’usage, vos questions. Vous verrez comment Qinode vous donne le contrôle en quelques jours, pas en quelques mois.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode" className="inline-flex items-center bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold hover:bg-black transition">Demander une démo live</a>
              <a href={`/${locale}/plateforme`} className="inline-flex items-center bg-white border border-slate-200 px-7 py-3.5 rounded-full text-[15px] font-semibold hover:border-[#032D60] transition">Voir le produit</a>
            </div>
            <div className="mt-6 text-[12px] text-slate-500">Réponse en 24h • Sans engagement • Hébergé en France</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-[1.25rem] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-slate-400">Ce que vous allez voir</div>
            <div className="mt-4 space-y-3">
              {['Votre inventaire cartographié sans effort', 'Votre chaîne électrique de A à Z', 'Votre jumeau 3D navigable', 'Votre rapport EU exporté en 1 clic — depuis le hardware 24/24'].map((line) => (
                <div key={line} className="flex gap-3 text-[14px] text-slate-700">
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center text-[11px]">✓</div>
                  <span className="font-medium">{line}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 rounded-xl bg-[#F8FAFC] border border-slate-100 text-[12px] leading-5 text-slate-600">
              <span className="font-semibold text-slate-800">Léon, Directeur DC – Lille</span><br />« On a arrêté Excel le premier jour. Enfin on sait ce qu’on a. »
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 lg:px-8 pb-12">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Stack souveraine — pour les équipes techniques</div>
            <div className="mt-2 text-[12px] leading-5 text-slate-600">Déploiement on-premise, données chez vous. Capteurs → ingest → ClickHouse / graphe → KPI EED → jumeau 3D.</div>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-slate-500">
              <span className="border border-slate-200 bg-[#F8FAFC] px-2 py-1 rounded">On-prem</span>
              <span className="border border-slate-200 bg-[#F8FAFC] px-2 py-1 rounded">Air-gapped possible</span>
              <span className="border border-slate-200 bg-[#F8FAFC] px-2 py-1 rounded">France / EU</span>
              <span className="border border-slate-200 bg-[#F8FAFC] px-2 py-1 rounded">24/24</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Référence éditeur</div>
              <a href="https://www.straton-dcim.com" target="_blank" rel="noopener" className="mt-1 block font-semibold text-[13px] text-[#032D60] hover:text-[#0176D3] underline underline-offset-4">STRATON DCIM</a>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Référence produit</div>
              <a href="https://www.straton-dcim.com/sunbird" target="_blank" rel="noopener" className="mt-1 block font-semibold text-[13px] text-[#032D60] hover:text-[#0176D3] underline underline-offset-4">Sunbird DCIM</a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-10 flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#032D60] flex items-center justify-center text-white font-extrabold">Q</div>
            <div>
              <div className="font-bold tracking-tight">QINODE.EU</div>
              <div className="text-[12px] text-slate-500 mt-1 leading-5">677 Avenue de la République, Lille — France<br />Plateforme DCIM souveraine, on-premise, sans cloud obligatoire.</div>
            </div>
          </div>
          <div className="text-[11px] font-mono text-slate-400 leading-6">
            <div>© Qinode.eu — Datacenter sous contrôle. Enfin.</div>
            <div>Contact : contact@qinode.eu • Réponse en 24h</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
