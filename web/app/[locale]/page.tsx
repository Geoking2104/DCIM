import Header from '@/components/Header';

export default function MarketingHome({ params: { locale } }: { params: { locale: string } }) {
  const demo = `/${locale}/plateforme`;
  return (
    <>
      <Header />
      <main>
        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-6 py-20 text-center">
            <p className="text-[12px] font-bold uppercase tracking-widest text-[#0176D3]">Qinode</p>
            <h1 className="mt-4 text-[48px] sm:text-[56px] leading-[0.95] font-black tracking-tight">
              Votre datacenter<br />sous contrôle. Enfin.
            </h1>
            <p className="mt-6 text-[18px] text-[#444] max-w-[640px] mx-auto">
              Une seule vue pour savoir ce qui tourne, ce qui chauffe, ce qui consomme — et ce qu’il faut bouger avant que ça casse.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={demo} className="px-6 py-3 bg-[#0176D3] text-white rounded font-semibold text-[14px]">Voir une démo</a>
              <a href={`/${locale}/modules/conformite-eed`} className="px-6 py-3 border rounded text-[14px]">Reporting énergie UE</a>
            </div>
          </div>
        </section>

        <section className="bg-[#FAFAF9] border-y">
          <div className="max-w-[1100px] mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-[28px] font-bold">Le problème</h2>
              <p className="mt-3 text-[#444]">Les infos sont éclatées : tableurs, salles, équipes, compteurs. On décide trop tard, ou on décide à l’aveugle.</p>
            </div>
            <div>
              <h2 className="text-[28px] font-bold">Ce que ça change</h2>
              <p className="mt-3 text-[#444]">Tout le site dans un même écran. On voit l’impact d’un geste avant de le faire. On documente pour les audits sans tout reconstruire à la main.</p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16">
            <h2 className="text-[28px] font-bold text-center">Six raisons de l’utiliser</h2>
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                ['Voir l’ensemble du site', 'Machines, armoires, prises, câbles — plus de liste à part.'],
                ['Savoir où poser le prochain serveur', 'Place, poids, électricité, froid : la réponse avant d’aller en salle.'],
                ['Bouger sans casser', 'Chaque déplacement laisse une trace. On sait qui a fait quoi.'],
                ['Comprendre la facture énergie', 'Où ça part, où ça se perd, où on peut économiser.'],
                ['Garder le climat sous contrôle', 'Repérer un point chaud avant qu’un rack sature.'],
                ['Préparer les rapports UE', 'Chiffres prêts pour une revue humaine — pas un tampon automatique.']
              ].map(([t, d]) => (
                <div key={t} className="slds-card p-5">
                  <h3 className="font-bold">{t}</h3>
                  <p className="text-[13px] text-[#444] mt-2">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#032D60] text-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16">
            <h2 className="text-[28px] font-bold">Pour qui</h2>
            <div className="mt-6 grid sm:grid-cols-3 gap-4 text-[14px]">
              <div className="border border-white/20 rounded p-4">Exploitants de salles — savoir ce qui est en prod ce soir.</div>
              <div className="border border-white/20 rounded p-4">Équipes énergie — suivre la conso sans triple saisie.</div>
              <div className="border border-white/20 rounded p-4">Direction / audit — un dossier propre, pas un export improvisé.</div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="max-w-[1100px] mx-auto px-6 py-16">
            <h2 className="text-[28px] font-bold text-center">Comment ça se passe</h2>
            <ol className="mt-8 grid md:grid-cols-3 gap-6">
              {[
                ['1', 'On branche ce qui existe déjà', 'Compteurs, inventaire, plans de salle. Pas besoin de tout jeter.'],
                ['2', 'On voit le site d’un coup', 'Armoires, flux, alertes. Une démo sur vos données ou un jeu d’exemple.'],
                ['3', 'On décide ensemble', 'Périmètre, hébergement en Europe, planning. Rien n’est imposé à l’aveugle.']
              ].map(([n, t, d]) => (
                <li key={n} className="slds-card p-5">
                  <div className="text-[22px] font-black text-[#0176D3]">{n}</div>
                  <h3 className="font-bold mt-2">{t}</h3>
                  <p className="text-[13px] text-[#444] mt-2">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 text-center">
              <a href={demo} className="inline-block px-8 py-3 bg-[#0176D3] text-white rounded font-semibold">Voir la plateforme</a>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-white">
        <div className="max-w-[1100px] mx-auto px-6 py-6 text-[11px] text-[#706E6B] flex flex-wrap gap-4">
          <span>© 2026 Qinode.eu</span>
          <a href={`/${locale}/plateforme`} className="underline">Plateforme</a>
          <a href={`/${locale}/power`} className="underline">Énergie</a>
        </div>
      </footer>
    </>
  );
}
