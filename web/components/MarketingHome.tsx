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

export default function MarketingHome({ locale }: { locale: string }) {
  const eed = `/${locale}/eed`;
  const maturite = `/${locale}/maturite`;
  const demo = 'mailto:contact@qinode.eu?subject=Demande%20de%20d%C3%A9mo%20Qinode';

  return (
    <div className="min-h-screen bg-white text-[#032D60] antialiased">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b">
        <div className="max-w-[1200px] mx-auto px-6 h-[72px] flex items-center justify-between">
          <a href={`/${locale}`} className="font-extrabold">QINODE<span className="text-[#0176D3]">.EU</span></a>
          <div className="flex gap-3 items-center text-[13px] font-semibold">
            <a href="#modules">Modules</a>
            <a href={maturite}>Diagnostic</a>
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
            <a href={maturite} className="bg-[#032D60] text-white px-7 py-3.5 rounded-full font-semibold">Faire le diagnostic</a>
            <a href="#modules" className="border px-7 py-3.5 rounded-full font-semibold">Voir les modules</a>
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
    </div>
  );
}
