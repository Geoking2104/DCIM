import ModuleShot from '@/components/ModuleShot';
import CoverIcon from '@/components/CoverIcons';

const MODULES = [
  { slug: 'actifs', icon: 'box', k: '01', title: 'Le matériel', hook: 'Plus besoin de chercher la machine. Elle a déjà sa fiche.', benefit: 'Une place, un câble, un responsable.', href: (l: string) => `/${l}/modules/actifs` },
  { slug: 'capacite', icon: 'place', k: '02', title: 'La place', hook: 'On sait si ça rentre — avant d’ouvrir la porte.', benefit: 'Hauteur, poids, courant, prises : le reste s’affiche.', href: (l: string) => `/${l}/modules/capacite` },
  { slug: 'changement', icon: 'calendar', k: '03', title: 'Les déplacements', hook: 'On écrit chaque déplacement. Rien ne se perd.', benefit: 'Demande, essai à l’écran, accord, journal.', href: (l: string) => `/${l}/modules/changement` },
  { slug: 'energie', icon: 'bolt', k: '04', title: 'L’électricité', hook: 'On voit où part le courant.', benefit: 'Du compteur du bâtiment jusqu’à la prise de l’armoire.', href: (l: string) => `/${l}/modules/energie` },
  { slug: 'environnement', icon: 'thermo', k: '05', title: 'Le climat', hook: 'Le point chaud se voit avant que ça grille.', benefit: 'La température de chaque allée, y compris l’eau froide.', href: (l: string) => `/${l}/modules/environnement` },
  { slug: 'puissance', icon: 'plug', k: '06', title: 'Les prises', hook: 'Chaque prise dit ce qu’elle consomme.', benefit: 'Mesure, historique, équilibre entre les phases.', href: (l: string) => `/${l}/power` },
  { slug: 'visualisation-3d', icon: 'cube', k: '07', title: 'La salle en volume', hook: 'Toute la salle, dans le navigateur.', benefit: 'Courant, chaleur et froid sur la même vue.', href: (l: string) => `/${l}/modules/visualisation-3d` },
  { slug: 'securite', icon: 'lock', k: '08', title: 'Les accès', hook: 'Chacun ne voit que ce qui le concerne.', benefit: 'Qui peut regarder, déplacer, exporter.', href: (l: string) => `/${l}/modules/securite` },
  { slug: 'analytique', icon: 'trend', k: '09', title: 'Les tendances', hook: 'On voit venir le problème avant l’alarme.', benefit: 'La charge dans le temps, pas une photo d’un jour.', href: (l: string) => `/${l}/modules/analytique` },
  { slug: 'connectivites', icon: 'cable', k: '10', title: 'Les câbles', hook: 'Un clic : tout ce qui tombe avec cette prise.', benefit: 'Câbles réseau et courant dans le même dessin.', href: (l: string) => `/${l}/modules/connectivites` },
  { slug: 'eed', icon: 'file', k: 'UE', title: 'Le dossier européen', hook: 'Le dossier énergie tient en un écran.', benefit: 'Électricité, eau, carbone : prêts à relire.', href: (l: string) => `/${l}/eed` }
] as const;

const BLOCKS = [
  {
    icon: 'eye',
    title: 'Voir ce qui se passe',
    items: [
      { icon: 'eye', t: 'Garder un œil, tout le temps', no: 'Trop d’écrans. L’alerte passe à côté.', yes: 'Une seule liste, jour et nuit.', how: 'Les armoires disent elles-mêmes si ça va.', links: [{ label: 'Les prises', path: '/power' }, { label: 'Les câbles', path: '/modules/connectivites' }] },
      { icon: 'trend', t: 'Voir venir la panne', no: 'On s’en rend compte trop tard.', yes: 'La courbe monte pendant la semaine.', how: 'On arrête une installation avant le week-end, pas après l’incident.', links: [{ label: 'Les tendances', path: '/modules/analytique' }, { label: 'Le climat', path: '/modules/environnement' }] },
      { icon: 'search', t: 'Trouver la cause', no: 'On cherche à la main.', yes: 'Un clic montre ce qui est touché.', how: 'La prise, le locataire, l’onduleur : tout le fil s’affiche.', links: [{ label: 'Les câbles', path: '/modules/connectivites' }, { label: 'Les déplacements', path: '/modules/changement' }] }
    ]
  },
  {
    icon: 'bolt',
    title: 'Courant et chaleur',
    items: [
      { icon: 'bolt', t: 'Suivre le courant', no: 'On relève à la main. Ça surcharge.', yes: 'Chaque prise est mesurée.', how: 'Du compteur du bâtiment à la prise : un seul chiffre.', links: [{ label: 'L’électricité', path: '/modules/energie' }, { label: 'Les prises', path: '/power' }] },
      { icon: 'thermo', t: 'Garder la salle au frais', no: 'Un capteur au fond. On rate le point chaud.', yes: 'Une carte de chaleur par allée.', how: 'Température et humidité, y compris les tuyaux d’eau froide.', links: [{ label: 'Le climat', path: '/modules/environnement' }, { label: 'La salle en volume', path: '/modules/visualisation-3d' }] },
      { icon: 'rack', t: 'Remplir sans coincer', no: 'Soit trop vide, soit plus de place.', yes: 'On voit ce qui reste avant de poser.', how: 'Hauteur, kilos, courant : on teste à l’écran.', links: [{ label: 'La place', path: '/modules/capacite' }, { label: 'La salle en volume', path: '/modules/visualisation-3d' }] }
    ]
  },
  {
    icon: 'box',
    title: 'Ce qui est dans la salle',
    items: [
      { icon: 'box', t: 'Savoir ce qui est là', no: 'Un tableur, souvent faux.', yes: 'La fiche suit la machine.', how: 'Nom, place, câbles, contrat : une seule fiche.', links: [{ label: 'Le matériel', path: '/modules/actifs' }] },
      { icon: 'cable', t: 'Suivre les fils', no: 'On tire le câble pour savoir où il va.', yes: 'Le chemin est dessiné.', how: 'De la prise jusqu’au service qui tourne dessus.', links: [{ label: 'Les câbles', path: '/modules/connectivites' }, { label: 'Le matériel', path: '/modules/actifs' }] },
      { icon: 'lock', t: 'Savoir qui a le droit', no: 'On se fie à la mémoire des équipes.', yes: 'Chaque visite est écrite.', how: 'Droits par personne et par locataire. Le dossier européen se relit à deux.', links: [{ label: 'Les accès', path: '/modules/securite' }, { label: 'Les déplacements', path: '/modules/changement' }, { label: 'Le dossier européen', path: '/eed' }] }
    ]
  },
  {
    icon: 'gauge',
    title: 'Choisir et prouver',
    items: [
      { icon: 'place', t: 'Prévoir la place', no: 'On estime à l’œil.', yes: 'Les chiffres de la salle décident.', how: 'Ce qui reste en hauteur et en courant, plus le mois qui vient.', links: [{ label: 'La place', path: '/modules/capacite' }, { label: 'Les tendances', path: '/modules/analytique' }] },
      { icon: 'calendar', t: 'Organiser le travail', no: 'Tout le monde se marche dessus.', yes: 'Une fenêtre courte, des rôles clairs.', how: 'D’où ça part, où ça arrive, qui dit oui.', links: [{ label: 'Les déplacements', path: '/modules/changement' }] },
      { icon: 'link', t: 'Parler aux autres outils', no: 'Chacun recopie sa liste.', yes: 'Une seule source. Les autres viennent lire.', how: 'La fiche n’existe qu’une fois.', links: [{ label: 'La plateforme', path: '/plateforme' }, { label: 'Le matériel', path: '/modules/actifs' }] },
      { icon: 'euro', t: 'Suivre l’argent', no: 'Le budget arrive trop tard.', yes: 'On voit le coût par armoire.', how: 'Le courant de chaque zone, et le carbone si on le demande.', links: [{ label: 'L’électricité', path: '/modules/energie' }, { label: 'Le dossier européen', path: '/eed' }] },
      { icon: 'gauge', t: 'Lire les bons chiffres', no: 'Le rapport arrive la semaine d’après.', yes: 'Les écrans bougent avec la salle.', how: 'Électricité, eau, chaleur récupérée : même horloge que les compteurs.', links: [{ label: 'Les tendances', path: '/modules/analytique' }, { label: 'Le dossier européen', path: '/eed' }] },
      { icon: 'file', t: 'Préparer le dossier', no: 'On assemble à la main. Il manque une page.', yes: 'Le dossier se construit. Quelqu’un relit.', how: 'Prêt pour l’Europe. Qinode ne signe pas à votre place.', links: [{ label: 'Le dossier européen', path: '/eed' }, { label: 'Les tendances', path: '/modules/analytique' }] }
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
            <a href={eed} className="text-[#0176D3]">Dossier européen</a>
            <a href={demo} className="bg-[#0176D3] text-white px-4 py-2 rounded-full">Démo</a>
          </div>
        </div>
      </header>

      <section className="max-w-[1200px] mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-[42px] md:text-[60px] font-extrabold leading-[0.92]">Votre salle machines<br />sous contrôle.<br /><span className="text-[#0176D3]">Enfin.</span></h1>
          <p className="mt-5 text-[18px] text-slate-600">On pose, on déplace, on refroidit, on prouve — sans tableur d’allée.</p>
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
              <div className="flex items-center gap-3 text-[#0176D3]">
                <span className="w-10 h-10 rounded-xl bg-[#E6F2FE] grid place-items-center"><CoverIcon name={m.icon} /></span>
                <span className="text-[11px] font-bold uppercase tracking-widest">{m.k} · {m.title}</span>
              </div>
              <h3 className="mt-3 text-[26px] font-extrabold">{m.hook}</h3>
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
          <p className="mt-3 text-slate-600 max-w-[56ch]">Sans outil unique, on court après. Avec Qinode, chaque sujet a son écran.</p>
          <div className="mt-10 space-y-12">
            {BLOCKS.map((b) => (
              <div key={b.title}>
                <div className="flex items-center gap-3 mb-5 text-[#0176D3]">
                  <div className="w-12 h-12 rounded-2xl bg-[#E6F2FE] grid place-items-center"><CoverIcon name={b.icon} className="w-8 h-8" /></div>
                  <h3 className="text-[22px] font-extrabold text-[#032D60]">{b.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {b.items.map((it) => (
                    <article key={it.t} className="bg-white border rounded-2xl p-5">
                      <div className="w-11 h-11 rounded-xl bg-[#E6F2FE] text-[#0176D3] grid place-items-center mb-3">
                        <CoverIcon name={it.icon} />
                      </div>
                      <h4 className="font-bold text-[16px]">{it.t}</h4>
                      <p className="mt-3 text-[13px] text-slate-500"><span className="text-red-500 font-bold">Sans outil — </span>{it.no}</p>
                      <p className="mt-2 text-[13px]"><span className="text-emerald-600 font-bold">Avec Qinode — </span>{it.yes}</p>
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
