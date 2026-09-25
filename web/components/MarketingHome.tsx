import ModuleShot from '@/components/ModuleShot';

const MODULES = [
  {
    slug: 'actifs',
    k: '01',
    title: 'Actifs',
    hook: 'Arrêtez de chercher l’équipement. Il est déjà sur la fiche.',
    benefit: 'Inventaire vivant jusqu’au port : vous vendez, déplacez et facturez sur une vérité unique — plus sur un Excel d’allée.',
    href: (l: string) => `/${l}/modules/actifs`
  },
  {
    slug: 'capacite',
    k: '02',
    title: 'Capacité',
    hook: 'Sachez si le prochain serveur entre — avant d’ouvrir la porte.',
    benefit: 'U, kilos, kW, ports : le headroom est sur l’écran. Vous évitez la pose qui fait sauter une phase.',
    href: (l: string) => `/${l}/modules/capacite`
  },
  {
    slug: 'changement',
    k: '03',
    title: 'Changement',
    hook: 'Chaque move laisse une trace. Plus de « on verra bien » à 2 h du matin.',
    benefit: 'Tickets, simulation, approbation, audit. Les équipes avancent plus vite, les auditeurs retrouvent le fil.',
    href: (l: string) => `/${l}/modules/changement`
  },
  {
    slug: 'energie',
    k: '04',
    title: 'Énergie',
    hook: 'Voyez où part le kWh — et où vous arrêtez d’en perdre.',
    benefit: 'Du compteur bâtiment au PDU de rack. Vous parlez budget et ASHRAE avec les mêmes chiffres.',
    href: (l: string) => `/${l}/modules/energie`
  },
  {
    slug: 'environnement',
    k: '05',
    title: 'Environnement',
    hook: 'Le point chaud se voit avant que le rack sature.',
    benefit: 'Climat par allée, liquid cooling compris. Vous baissez le froid sans jouer à la roulette avec le matériel.',
    href: (l: string) => `/${l}/modules/environnement`
  },
  {
    slug: 'puissance',
    k: '06',
    title: 'Puissance',
    hook: 'La prise du serveur parle. Plus besoin de deviner la charge.',
    benefit: 'Mesure à la prise, historique, déséquilibre de phase. Vous décidez un move, vous n’observez pas un graphe mort.',
    href: (l: string) => `/${l}/power`
  },
  {
    slug: 'visualisation-3d',
    k: '07',
    title: 'Jumeau 3D',
    hook: 'La salle entière, dans le navigateur. Sans installer quoi que ce soit.',
    benefit: 'Élec, thermique, liquid cooling sur le même jumeau. La réunion se fait sur le site, pas sur un plan PDF.',
    href: (l: string) => `/${l}/modules/visualisation-3d`
  },
  {
    slug: 'securite',
    k: '08',
    title: 'Accès & tenants',
    hook: 'Chaque locataire ne voit que son périmètre. Point.',
    benefit: 'Rôles, zones, step-up. L’information reste entre les bonnes mains — y compris à l’audit.',
    href: (l: string) => `/${l}/modules/securite`
  },
  {
    slug: 'analytique',
    k: '09',
    title: 'BI & analytique',
    hook: 'La tendance parle avant l’alarme.',
    benefit: 'Charge, PUE, headroom en séries. Vous galez une pose GPU le mardi, pas après l’incident du dimanche.',
    href: (l: string) => `/${l}/modules/analytique`
  },
  {
    slug: 'connectivites',
    k: '10',
    title: 'Connectivités',
    hook: 'Un clic sur un port. Tout ce qui tombe avec.',
    benefit: 'Chaîne réseau + élec dans le même graphe. Blast radius en une seconde, pas en trois réunions.',
    href: (l: string) => `/${l}/modules/connectivites`
  },
  {
    slug: 'eed',
    k: 'EED',
    title: 'Conformité EED',
    hook: 'Le dossier UE en un écran. Plus en trois semaines de tableur.',
    benefit: 'PUE, WUE, CUE, ERF et échelle A–G en preview. Export prêt pour une revue humaine — pas un tampon automatique.',
    href: (l: string) => `/${l}/eed`
  }
] as const;

export default function MarketingHome({ locale }: { locale: string }) {
  const plateforme = `/${locale}/plateforme`;
  const eed = `/${locale}/eed`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <div className="bg-[#032D60] text-white">
        <div className="max-w-[1200px] mx-auto px-6 h-8 flex items-center justify-between text-[11px]">
          <span className="opacity-90">Souverain • On-premise • Sans cloud obligatoire</span>
          <a href={plateforme} className="underline opacity-90">Ouvrir la plateforme →</a>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/${locale}`} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#032D60] text-white font-extrabold grid place-items-center">Q</div>
            <div>
              <div className="font-extrabold text-[17px] leading-none">QINODE<span className="text-[#0176D3]">.EU</span></div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-semibold mt-0.5">Datacenter sous contrôle</div>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <a href="#modules" className="hidden md:inline-flex text-[13px] font-semibold px-3 py-2">Modules</a>
            <a href={eed} className="inline-flex text-[13px] font-semibold text-[#0176D3] px-3 py-2">EED</a>
            <a href={demo} className="inline-flex bg-[#0176D3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-full">Demander une démo</a>
          </div>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 pt-16 md:pt-24 pb-12 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-[#F3F3F3] border rounded-full px-3.5 py-1.5 text-[11px] font-semibold mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> 10 MODULES + EED
          </div>
          <h1 className="text-[42px] md:text-[64px] font-extrabold tracking-tight leading-[0.9]">
            Votre datacenter<br />sous contrôle.<br /><span className="text-[#0176D3]">Enfin.</span>
          </h1>
          <p className="mt-6 text-[18px] text-slate-600 max-w-[48ch]">
            Une interface par décision : poser, déplacer, refroidir, prouver. Chaque module a un bénéfice mesurable — et sa copie d’écran.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#modules" className="bg-[#032D60] text-white px-7 py-3.5 rounded-full text-[15px] font-semibold">Voir les modules</a>
            <a href={eed} className="border px-7 py-3.5 rounded-full text-[15px] font-semibold">Module EED</a>
          </div>
        </div>
        <ModuleShot variant="eed" />
      </section>

      <section id="modules" className="bg-[#F8FAFC] border-y">
        <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-14">
          <div>
            <h2 className="text-[30px] md:text-[40px] font-extrabold leading-[1.05]">Ce que chaque module vous fait gagner.</h2>
            <p className="mt-3 text-slate-600 max-w-[60ch]">Pas de jargon pour le plaisir. Un bénéfice, une copie d’écran produit.</p>
          </div>
          {MODULES.map((m, i) => {
            const reverse = i % 2 === 1;
            return (
              <article key={m.slug} className={`grid lg:grid-cols-2 gap-8 items-center ${reverse ? 'lg:[&>div:first-child]:order-2' : ''}`}>
                <div>
                  <div className="text-[11px] font-bold tracking-[0.18em] uppercase text-[#0176D3]">{m.k} · {m.title}</div>
                  <h3 className="mt-2 text-[24px] md:text-[28px] font-extrabold leading-[1.15]">{m.hook}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-slate-600">{m.benefit}</p>
                  <a href={m.href(locale)} className="inline-flex mt-5 text-[13px] font-semibold text-[#0176D3]">
                    Ouvrir le module →
                  </a>
                </div>
                <a href={m.href(locale)} className="block">
                  <ModuleShot variant={m.slug} />
                </a>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-6 py-16">
        <div className="rounded-[1.75rem] bg-[#032D60] text-white p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold">On vous le montre sur vos racks ?</h2>
            <p className="mt-2 text-[14px] text-blue-100">20 minutes. Interface réelle, pas de slides.</p>
          </div>
          <a href={demo} className="bg-white text-[#032D60] px-7 py-3.5 rounded-full text-[14px] font-semibold shrink-0">Demander une démo live</a>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-wrap gap-4 text-[13px] justify-between">
          <span className="font-bold">QINODE.EU</span>
          <div className="flex gap-4">
            <a className="underline" href={plateforme}>Plateforme</a>
            <a className="underline" href={eed}>EED</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
