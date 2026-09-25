import ModuleShot from '@/components/ModuleShot';

const MODULES = [
  { slug: 'actifs', k: '01', title: 'Actifs', hook: 'Arrêtez de chercher l’équipement. Il est déjà sur la fiche.', benefit: 'Inventaire vivant jusqu’au port.', href: (l: string) => `/${l}/modules/actifs` },
  { slug: 'capacite', k: '02', title: 'Capacité', hook: 'Sachez si le prochain serveur entre — avant d’ouvrir la porte.', benefit: 'U, kilos, kW, ports.', href: (l: string) => `/${l}/modules/capacite` },
  { slug: 'changement', k: '03', title: 'Changement', hook: 'Chaque move laisse une trace.', benefit: 'Tickets, simulation, audit.', href: (l: string) => `/${l}/modules/changement` },
  { slug: 'energie', k: '04', title: 'Énergie', hook: 'Voyez où part le kWh.', benefit: 'Compteur bâtiment → PDU rack.', href: (l: string) => `/${l}/modules/energie` },
  { slug: 'environnement', k: '05', title: 'Environnement', hook: 'Le point chaud avant la saturation.', benefit: 'Climat par allée.', href: (l: string) => `/${l}/modules/environnement` },
  { slug: 'puissance', k: '06', title: 'Puissance', hook: 'La prise du serveur parle.', benefit: 'Mesure à la prise.', href: (l: string) => `/${l}/power` },
  { slug: 'visualisation-3d', k: '07', title: 'Jumeau 3D', hook: 'La salle dans le navigateur.', benefit: 'Élec + thermique + liquide.', href: (l: string) => `/${l}/modules/visualisation-3d` },
  { slug: 'securite', k: '08', title: 'Accès', hook: 'Chaque locataire, son périmètre.', benefit: 'Rôles et zones.', href: (l: string) => `/${l}/modules/securite` },
  { slug: 'analytique', k: '09', title: 'BI', hook: 'La tendance avant l’alarme.', benefit: 'Séries PUE / charge.', href: (l: string) => `/${l}/modules/analytique` },
  { slug: 'connectivites', k: '10', title: 'Connectivités', hook: 'Un clic, le blast radius.', benefit: 'Réseau + élec.', href: (l: string) => `/${l}/modules/connectivites` },
  { slug: 'eed', k: 'EED', title: 'EED', hook: 'Le dossier UE en un écran.', benefit: 'PUE WUE CUE ERF preview.', href: (l: string) => `/${l}/eed` }
] as const;

type Cover = { how: string; links: { label: string; path: string }[] };

const COMPARE: { group: string; rows: { c: string; no: string; yes: string; cover: Cover }[] }[] = [
  {
    group: 'Supervision & résilience',
    rows: [
      { c: 'Surveillance temps réel', no: 'Outils disparates. Alerte manquée.', yes: 'Alertes 24/7, zéro angle mort.', cover: { how: 'Subscriptions GraphQL + status racks / PDU. Une file d’alarmes, pas cinq consoles.', links: [{ label: 'Puissance', path: '/power' }, { label: 'Connectivités', path: '/modules/connectivites' }] } },
      { c: 'Prévention des incidents', no: 'Réactive. Audits périodiques.', yes: 'Prédictif en continu.', cover: { how: 'Dérive 7 j sur charge, PUE, hotspots. On gèle une pose avant le dimanche.', links: [{ label: 'Analytique', path: '/modules/analytique' }, { label: 'Environnement', path: '/modules/environnement' }] } },
      { c: 'Temps de réponse', no: 'Détection manuelle lente.', yes: 'Identification immédiate de la panne.', cover: { how: 'Clic sur un port ou un PDU → blast radius apps, tenant, prise, UPS.', links: [{ label: 'Connectivités', path: '/modules/connectivites' }, { label: 'Changement', path: '/modules/changement' }] } }
    ]
  },
  {
    group: 'Énergie & infrastructure',
    rows: [
      { c: 'Gestion de l’énergie', no: 'Relevés manuels. Surcharge.', yes: 'Contrôle PDU. Coûts en baisse.', cover: { how: 'Chaîne compteur → UPS → PDU → prise. PUE preview daté, official=false.', links: [{ label: 'Énergie', path: '/modules/energie' }, { label: '/power', path: '/power' }, { label: 'EED', path: '/eed' }] } },
      { c: 'Gestion thermique', no: 'Capteurs isolés. Points chauds.', yes: 'Carte thermique et flux d’air.', cover: { how: 'T/φ par allée + calque jumeau. Liquid cooling ΔT / débit / fuite.', links: [{ label: 'Environnement', path: '/modules/environnement' }, { label: 'Jumeau 3D', path: '/modules/visualisation-3d' }] } },
      { c: 'Optimisation espace', no: 'Racks mal remplis.', yes: 'Remplissage maximisé.', cover: { how: 'U / kg / kW / ports par rack. Simulation avant pose.', links: [{ label: 'Capacité', path: '/modules/capacite' }, { label: 'Jumeau 3D', path: '/modules/visualisation-3d' }] } }
    ]
  },
  {
    group: 'Gestion des actifs',
    rows: [
      { c: 'Inventaire IT', no: 'Excel d’allée.', yes: 'Inventaire synchro.', cover: { how: 'Fiche asset = U, ports, contrat, tenant. Découverte Redfish/SNMP reconcilée.', links: [{ label: 'Actifs', path: '/modules/actifs' }] } },
      { c: 'Gestion du câblage', no: 'Traçabilité laborieuse.', yes: 'Chemin bout en bout.', cover: { how: 'Port → panneau → NIC → app dans le graphe. Pas un visio déconnecté.', links: [{ label: 'Connectivités', path: '/modules/connectivites' }, { label: 'Actifs', path: '/modules/actifs' }] } },
      { c: 'Sécurité & conformité', no: 'Contrôles humains poreux.', yes: 'Traçabilité accès + moves.', cover: { how: 'Rôles Keycloak / tenant + journal WO immuable + preview EED.', links: [{ label: 'Accès', path: '/modules/securite' }, { label: 'Changement', path: '/modules/changement' }, { label: 'EED', path: '/eed' }] } }
    ]
  },
  {
    group: 'Stratégie & pilotage',
    rows: [
      { c: 'Capacity planning', no: 'Doigt mouillé.', yes: 'Projections sur data réelle.', cover: { how: 'Headroom U/kW/ports + séries 30 j. Décision de pose avant la visite salle.', links: [{ label: 'Capacité', path: '/modules/capacite' }, { label: 'Analytique', path: '/modules/analytique' }] } },
      { c: 'Planification interventions', no: 'Coordination complexe.', yes: 'Arrêts plus courts.', cover: { how: 'WO = source, cible, fenêtre, blast radius, approbateurs. Le graphe refuse un move impossible.', links: [{ label: 'Changement', path: '/modules/changement' }] } },
      { c: 'Intégration ITSM / CMDB', no: 'Silos, devs manuels.', yes: 'API, source unique.', cover: { how: 'GraphQL + CSoT. L’asset n’existe qu’une fois ; ITSM consomme le graphe.', links: [{ label: 'Plateforme', path: '/plateforme' }, { label: 'Actifs', path: '/modules/actifs' }] } },
      { c: 'Suivi des coûts', no: 'Budget flou.', yes: 'Dépenses lisibles.', cover: { how: 'kWh par nœud × facteur d’émission. CUE / PUE pour arbitrer le kWh, pas le ressenti.', links: [{ label: 'Énergie', path: '/modules/energie' }, { label: 'EED', path: '/eed' }] } },
      { c: 'Visibilité des KPIs', no: 'Rapports en retard.', yes: 'Dashboards live.', cover: { how: 'PUE, WUE, CUE, ERF, headroom, hotspots — même horloge que les compteurs.', links: [{ label: 'Analytique', path: '/modules/analytique' }, { label: 'EED', path: '/eed' }] } },
      { c: 'Analyse & rapports', no: 'Tâches incomplètes.', yes: 'Génération + revue humaine.', cover: { how: 'Export JSON Annexe III, preview A–G, official=false. Le tampon UE reste humain.', links: [{ label: 'EED', path: '/eed' }, { label: 'Analytique', path: '/modules/analytique' }] } }
    ]
  }
];

export default function MarketingHome({ locale }: { locale: string }) {
  const plateforme = `/${locale}/plateforme`;
  const eed = `/${locale}/eed`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/${locale}`} className="font-extrabold">QINODE<span className="text-[#0176D3]">.EU</span></a>
          <div className="flex gap-3 items-center text-[13px] font-semibold">
            <a href="#comparer">Comparer</a>
            <a href={eed} className="text-[#0176D3]">EED</a>
            <a href={demo} className="bg-[#0176D3] text-white px-4 py-2 rounded-full">Démo</a>
          </div>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[42px] md:text-[60px] font-extrabold leading-[0.92]">Votre datacenter<br />sous contrôle.<br /><span className="text-[#0176D3]">Enfin.</span></h1>
          <p className="mt-5 text-[18px] text-slate-600">Chaque ligne du comparatif pointe vers le module qui la tient.</p>
          <a href="#comparer" className="inline-block mt-8 bg-[#032D60] text-white px-7 py-3.5 rounded-full font-semibold">Voir la couverture</a>
        </div>
        <ModuleShot variant="eed" />
      </section>

      <section id="comparer" className="bg-[#F8FAFC] border-y">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="text-[32px] md:text-[40px] font-extrabold">Sans DCIM. Couvert par Qinode.</h2>
          <div className="mt-8 overflow-x-auto rounded-2xl border bg-white">
            <table className="w-full text-[13px]">
              <thead className="bg-[#032D60] text-white">
                <tr>
                  <th className="text-left p-3">Critère</th>
                  <th className="text-left p-3">Sans DCIM</th>
                  <th className="text-left p-3">Avec Qinode</th>
                  <th className="text-left p-3">Comment c’est couvert</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((g) => (
                  <>
                    <tr key={g.group} className="bg-[#E6F2FE]"><td colSpan={4} className="px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">{g.group}</td></tr>
                    {g.rows.map((r) => (
                      <tr key={r.c} className="border-t align-top">
                        <td className="p-3 font-semibold">{r.c}</td>
                        <td className="p-3 text-slate-500">{r.no}</td>
                        <td className="p-3">{r.yes}</td>
                        <td className="p-3">
                          <p className="text-slate-600">{r.cover.how}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {r.cover.links.map((l) => (
                              <a key={l.path} href={`/${locale}${l.path}`} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E6F2FE] text-[#0176D3]">{l.label}</a>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="modules" className="max-w-[1200px] mx-auto px-6 py-16 space-y-12">
        {MODULES.map((m, i) => (
          <article key={m.slug} className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 ? 'lg:[&>div:first-child]:order-2' : ''}`}>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">{m.k} · {m.title}</div>
              <h3 className="mt-2 text-[26px] font-extrabold">{m.hook}</h3>
              <p className="mt-2 text-slate-600">{m.benefit}</p>
              <a href={m.href(locale)} className="inline-block mt-4 text-[13px] font-semibold text-[#0176D3]">Ouvrir →</a>
            </div>
            <a href={m.href(locale)}><ModuleShot variant={m.slug} /></a>
          </article>
        ))}
      </section>
    </div>
  );
}
