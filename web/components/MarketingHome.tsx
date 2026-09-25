import ModuleShot from '@/components/ModuleShot';

const MODULES = [
  { slug: 'actifs', k: '01', title: 'Matériel', hook: 'Arrêtez de chercher l’équipement. Il est déjà sur la fiche.', benefit: 'Chaque machine a une place, un câble, un responsable.', href: (l: string) => `/${l}/modules/actifs` },
  { slug: 'capacite', k: '02', title: 'Place disponible', hook: 'Sachez si le prochain serveur entre — avant d’ouvrir la porte.', benefit: 'Hauteur, poids, courant, prises réseau : le reste s’affiche.', href: (l: string) => `/${l}/modules/capacite` },
  { slug: 'changement', k: '03', title: 'Déplacements', hook: 'Chaque déplacement laisse une trace.', benefit: 'Demande, simulation, accord, journal.', href: (l: string) => `/${l}/modules/changement` },
  { slug: 'energie', k: '04', title: 'Électricité', hook: 'Voyez où part l’électricité.', benefit: 'Du compteur du bâtiment jusqu’à la prise de l’armoire.', href: (l: string) => `/${l}/modules/energie` },
  { slug: 'environnement', k: '05', title: 'Climat', hook: 'Le point chaud se voit avant que l’armoire sature.', benefit: 'Température par allée, y compris le refroidissement liquide.', href: (l: string) => `/${l}/modules/environnement` },
  { slug: 'puissance', k: '06', title: 'Prises', hook: 'La prise du serveur parle.', benefit: 'Mesure à la prise, historique, phases équilibrées.', href: (l: string) => `/${l}/power` },
  { slug: 'visualisation-3d', k: '07', title: 'Salle en 3D', hook: 'La salle entière, dans le navigateur.', benefit: 'Électricité, chaleur et froid sur la même vue.', href: (l: string) => `/${l}/modules/visualisation-3d` },
  { slug: 'securite', k: '08', title: 'Accès', hook: 'Chaque locataire ne voit que son périmètre.', benefit: 'Qui a le droit de voir, de déplacer, d’exporter.', href: (l: string) => `/${l}/modules/securite` },
  { slug: 'analytique', k: '09', title: 'Tendances', hook: 'La tendance parle avant l’alarme.', benefit: 'Charge et efficacité dans le temps, pas une photo figée.', href: (l: string) => `/${l}/modules/analytique` },
  { slug: 'connectivites', k: '10', title: 'Câbles et courant', hook: 'Un clic sur une prise. Tout ce qui tombe avec.', benefit: 'Réseau et électricité dans le même dessin.', href: (l: string) => `/${l}/modules/connectivites` },
  { slug: 'eed', k: 'UE', title: 'Dossier énergie européen', hook: 'Le dossier européen en un écran.', benefit: 'Chiffres d’énergie, d’eau et de carbone prêts à relire.', href: (l: string) => `/${l}/eed` }
] as const;

function Icon({ name }: { name: string }) {
  const common = 'w-8 h-8';
  if (name === 'eye') return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>;
  if (name === 'bolt') return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/></svg>;
  if (name === 'box') return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/></svg>;
  return <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19V5h16v14"/><path d="M8 19v-6h8v6"/></svg>;
}

const BLOCKS = [
  {
    icon: 'eye',
    title: 'Voir et réagir',
    items: [
      { t: 'Surveiller en direct', no: 'Plusieurs écrans. Une alerte passe à côté.', yes: 'Une seule file d’alertes, jour et nuit.', how: 'Les prises et les armoires poussent leur état. Plus besoin de cinq consoles.', links: [{ label: 'Prises', path: '/power' }, { label: 'Câbles', path: '/modules/connectivites' }] },
      { t: 'Anticiper la panne', no: 'On réagit après coup, lors d’un contrôle.', yes: 'On voit la tendance monter pendant la semaine.', how: 'La charge et les points chauds sont suivis tous les jours. On bloque une installation avant le week-end.', links: [{ label: 'Tendances', path: '/modules/analytique' }, { label: 'Climat', path: '/modules/environnement' }] },
      { t: 'Trouver la cause', no: 'On cherche à la main, ça prend du temps.', yes: 'Un clic montre ce qui tombe avec.', how: 'Une prise réseau ou électrique affiche les applications, le locataire et l’onduleur derrière.', links: [{ label: 'Câbles', path: '/modules/connectivites' }, { label: 'Déplacements', path: '/modules/changement' }] }
    ]
  },
  {
    icon: 'bolt',
    title: 'Électricité et climat',
    items: [
      { t: 'Suivre l’électricité', no: 'Relevés à la main. Risque de surcharge.', yes: 'Chaque prise est mesurée. La facture baisse.', how: 'Du compteur du bâtiment jusqu’à la prise de l’armoire, le même chiffre.', links: [{ label: 'Électricité', path: '/modules/energie' }, { label: 'Prises', path: '/power' }] },
      { t: 'Garder la salle au frais', no: 'Un capteur au fond. Des points chauds invisibles.', yes: 'Carte de chaleur par allée.', how: 'Température et humidité par rangée, y compris les boucles d’eau froide.', links: [{ label: 'Climat', path: '/modules/environnement' }, { label: 'Salle en 3D', path: '/modules/visualisation-3d' }] },
      { t: 'Remplir les armoires', no: 'De la place perdue, ou plus de place du tout.', yes: 'On voit ce qui reste avant de poser.', how: 'Hauteur libre, kilos, courant et prises réseau : la pose est testée à l’écran.', links: [{ label: 'Place disponible', path: '/modules/capacite' }, { label: 'Salle en 3D', path: '/modules/visualisation-3d' }] }
    ]
  },
  {
    icon: 'box',
    title: 'Le matériel',
    items: [
      { t: 'Savoir ce qui est là', no: 'Un tableur d’allée, souvent faux.', yes: 'La fiche suit la machine.', how: 'Nom, hauteur, ports, contrat, locataire : une seule fiche.', links: [{ label: 'Matériel', path: '/modules/actifs' }] },
      { t: 'Suivre les câbles', no: 'On tire le fil pour savoir où il va.', yes: 'Le chemin est dessiné de bout en bout.', how: 'De la prise murale à l’application, le dessin est le même que la salle.', links: [{ label: 'Câbles', path: '/modules/connectivites' }, { label: 'Matériel', path: '/modules/actifs' }] },
      { t: 'Garder la main sur les accès', no: 'On fait confiance à la mémoire des équipes.', yes: 'Chaque visite et chaque déplacement est écrit.', how: 'Droits par personne et par locataire. Le dossier énergie européen reste une relecture humaine.', links: [{ label: 'Accès', path: '/modules/securite' }, { label: 'Déplacements', path: '/modules/changement' }, { label: 'Dossier UE', path: '/eed' }] }
    ]
  },
  {
    icon: 'chart',
    title: 'Décider',
    items: [
      { t: 'Prévoir la place', no: 'On estime « à vue ».', yes: 'Les chiffres de la salle décident.', how: 'Ce qui reste en hauteur et en courant, plus la tendance du mois.', links: [{ label: 'Place disponible', path: '/modules/capacite' }, { label: 'Tendances', path: '/modules/analytique' }] },
      { t: 'Organiser les interventions', no: 'Tout le monde se marche dessus.', yes: 'Fenêtre courte, équipes alignées.', how: 'D’où ça part, où ça arrive, qui valide. Un déplacement impossible est refusé avant la nuit.', links: [{ label: 'Déplacements', path: '/modules/changement' }] },
      { t: 'Parler aux autres outils', no: 'Chacun a sa liste. On recopie.', yes: 'Une seule source. Les autres outils viennent lire.', how: 'La fiche matériel n’existe qu’une fois. Le reste s’y branche.', links: [{ label: 'Plateforme', path: '/plateforme' }, { label: 'Matériel', path: '/modules/actifs' }] },
      { t: 'Suivre les dépenses', no: 'Le budget arrive trop tard.', yes: 'On voit le coût par armoire.', how: 'L’électricité de chaque zone, convertie en carbone si besoin.', links: [{ label: 'Électricité', path: '/modules/energie' }, { label: 'Dossier UE', path: '/eed' }] },
      { t: 'Lire les chiffres utiles', no: 'Le rapport arrive la semaine suivante.', yes: 'Les écrans bougent avec la salle.', how: 'Énergie, eau, chaleur récupérée : même horloge que les compteurs.', links: [{ label: 'Tendances', path: '/modules/analytique' }, { label: 'Dossier UE', path: '/eed' }] },
      { t: 'Préparer les dossiers', no: 'On assemble à la main, il manque une page.', yes: 'Le dossier se construit tout seul. Une personne relit.', how: 'Export prêt pour l’Europe. Qinode n’appose pas le tampon à votre place.', links: [{ label: 'Dossier UE', path: '/eed' }, { label: 'Tendances', path: '/modules/analytique' }] }
    ]
  }
];

export default function MarketingHome({ locale }: { locale: string }) {
  const eed = `/${locale}/eed`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/${locale}`} className="font-extrabold">QINODE<span className="text-[#0176D3]">.EU</span></a>
          <div className="flex gap-3 items-center text-[13px] font-semibold">
            <a href="#modules">Modules</a>
            <a href="#couvert">Couvert par Qinode</a>
            <a href={eed} className="text-[#0176D3]">Dossier UE</a>
            <a href={demo} className="bg-[#0176D3] text-white px-4 py-2 rounded-full">Démo</a>
          </div>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[42px] md:text-[60px] font-extrabold leading-[0.92]">Votre salle machines<br />sous contrôle.<br /><span className="text-[#0176D3]">Enfin.</span></h1>
          <p className="mt-5 text-[18px] text-slate-600">Posez, déplacez, refroidissez, prouvez — sans tableur d’allée.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#modules" className="bg-[#032D60] text-white px-7 py-3.5 rounded-full font-semibold">Voir les modules</a>
            <a href="#couvert" className="border px-7 py-3.5 rounded-full font-semibold">Couvert par Qinode</a>
          </div>
        </div>
        <ModuleShot variant="eed" />
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

      <section id="couvert" className="bg-[#F8FAFC] border-t">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <h2 className="text-[32px] md:text-[40px] font-extrabold">Couvert par Qinode</h2>
          <p className="mt-3 text-slate-600 max-w-[56ch]">Sans outil unique, on rattrape. Avec Qinode, chaque sujet a un écran.</p>
          <div className="mt-10 space-y-8">
            {BLOCKS.map((b) => (
              <div key={b.title}>
                <div className="flex items-center gap-3 text-[#0176D3] mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F2FE] grid place-items-center"><Icon name={b.icon} /></div>
                  <h3 className="text-[22px] font-extrabold text-[#032D60]">{b.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {b.items.map((it) => (
                    <article key={it.t} className="bg-white border rounded-2xl p-5">
                      <h4 className="font-bold text-[16px]">{it.t}</h4>
                      <p className="mt-3 text-[13px] text-slate-500"><span className="text-red-500 font-bold">Sans — </span>{it.no}</p>
                      <p className="mt-2 text-[13px]"><span className="text-emerald-600 font-bold">Avec — </span>{it.yes}</p>
                      <p className="mt-3 text-[13px] text-slate-600">{it.how}</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {it.links.map((l) => (
                          <a key={l.path} href={`/${locale}${l.path}`} className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E6F2FE] text-[#0176D3]">{l.label}</a>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
