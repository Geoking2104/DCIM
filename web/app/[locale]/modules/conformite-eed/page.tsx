import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Module Conformité EED & Label A-G | Qinode',
  description:
    'Previews EED (Règlement UE 2024/1364), calculs PUE/WUE/CUE/ERF, échelle A–G interne et export JSON dry-run vers le registre européen.'
};

export default function ConformiteEedPage({
  params
}: {
  params: { locale?: string };
}) {
  const locale = params?.locale || 'fr';
  const defaultSiteId = 'site-paris-01';
  const defaultSiteName = 'Paris East High-Density Data Center';

  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-[11px] text-slate-400 flex gap-2">
            <a href={`/${locale}`} className="hover:underline">Qinode</a>
            <span>/</span>
            <a href={`/${locale}/modules/actifs`} className="hover:underline">Modules</a>
            <span>/</span>
            <span className="text-white">Conformité EED</span>
          </div>

          <div className="border-b border-slate-800 pb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-950/60 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Règlement Délégué (UE) 2024/1364</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Conformité EED & Label Énergétique Européen
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Module de calcul des métriques de l&apos;Annexe III (PUE, WUE, CUE, ERF), de suivi de la
              réutilisation de chaleur fatale et de génération d&apos;un payload JSON. Le label / QR
              officiel reste émis par la base européenne — Qinode expose une preview (official=false).
            </p>
            <p className="mt-2 text-xs text-slate-500 font-mono">
              {defaultSiteName} · {defaultSiteId}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200">Supervision temps réel &amp; certification (preview)</h2>
            <EedComplianceContainer siteId={defaultSiteId} siteName={defaultSiteName} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-900">
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-indigo-400">01.</span>
                <span>Calculs Annexe III &amp; Barème A–G</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Le moteur ingère la métrologie électrique, hydraulique et thermique. L’échelle A–G
                ci-dessous est une lecture interne, pas le label UE :
              </p>
              <ul className="text-xs text-slate-300 space-y-2 font-mono">
                <li className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-emerald-400 font-bold">Classe A :</span>
                  <span>PUE ≤ 1.15</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-green-400 font-bold">Classe B :</span>
                  <span>1.15 &lt; PUE ≤ 1.25</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-lime-400 font-bold">Classe C :</span>
                  <span>1.25 &lt; PUE ≤ 1.35</span>
                </li>
                <li className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-yellow-400 font-bold">Classe D à G :</span>
                  <span>PUE &gt; 1.35</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <span className="text-teal-400">02.</span>
                <span>Réutilisation de chaleur fatale &amp; EnEfG</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paliers 10 / 15 / 20 % ERF : loi allemande EnEfG, pas un seuil UE universel.
                Affichés comme trajectoire si le site est dans ce périmètre.
              </p>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Objectif 2026 (EnEfG) :</span>
                  <span className="font-bold text-amber-400">10 % ERF</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Objectif 2027 (EnEfG) :</span>
                  <span className="font-bold text-emerald-400">15 % ERF</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Objectif 2028+ (EnEfG) :</span>
                  <span className="font-bold text-indigo-400">20 % ERF</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Providers>
  );
}
