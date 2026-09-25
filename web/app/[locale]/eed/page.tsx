import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Module Conformité EED & preview A–G | Qinode',
  description:
    'Previews EED (Règlement UE 2024/1364) : PUE/WUE/CUE/ERF, échelle A–G interne et export JSON dry-run. Le label officiel est émis par la base européenne.'
};

export default function ConformiteEedPage({
  params
}: {
  params: { locale?: string };
}) {
  const locale = params?.locale || 'fr';
  const defaultSiteId = 'PAR-1';
  const defaultSiteName = 'PAR-1 · Paris East High-Density (démo)';

  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-[#F4F6F9] text-[#032D60] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-[11px] text-[#706E6B] flex gap-2">
            <a href={`/${locale}`} className="hover:underline">Qinode</a>
            <span>/</span>
            <span className="font-bold text-[#032D60]">EED · 2024/1364</span>
          </div>

          <div className="border-b border-[#E5E5E5] pb-8">
            <div className="inline-flex items-center space-x-2 bg-[#E6F2FE] text-[#0176D3] border border-[#C9E2F5] px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-[#0176D3]" />
              <span>Règlement délégué (UE) 2024/1364</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Conformité EED & échelle énergétique A–G
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#444] max-w-3xl leading-relaxed">
              Module de calcul des métriques Annexe III (PUE, WUE, CUE, ERF), de suivi de la chaleur fatale
              et de génération d’un payload JSON <strong>preview</strong>. Qinode n’émet pas le label / QR officiel
              — ceux-ci viennent de la base européenne.
            </p>
            <p className="mt-2 text-xs text-[#706E6B]">
              Site démo : {defaultSiteName} · <span className="font-mono">{defaultSiteId}</span> · official=false
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold">Supervision & previews de certification</h2>
            <EedComplianceContainer siteId={defaultSiteId} siteName={defaultSiteName} />
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t">
            <div className="bg-white border rounded p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <span className="text-[#0176D3]">01.</span>
                <span>Calculs Annexe III & barème A–G (preview)</span>
              </h3>
              <p className="text-xs text-[#444] leading-relaxed">
                Le moteur ingère la métrologie électrique, hydraulique et thermique pour un PUE interne.
                L’échelle A–G ci-dessous est une <strong>lecture interne</strong>, pas le label UE :
              </p>
              <ul className="text-xs space-y-2 font-mono">
                <li className="flex justify-between border-b pb-1"><span className="text-emerald-700 font-bold">Classe A</span><span>PUE ≤ 1.15</span></li>
                <li className="flex justify-between border-b pb-1"><span className="text-green-700 font-bold">Classe B</span><span>1.15 &lt; PUE ≤ 1.25</span></li>
                <li className="flex justify-between border-b pb-1"><span className="text-lime-700 font-bold">Classe C</span><span>1.25 &lt; PUE ≤ 1.35</span></li>
                <li className="flex justify-between"><span className="text-amber-700 font-bold">Classes D à G</span><span>PUE &gt; 1.35</span></li>
              </ul>
              <p className="text-[11px] text-[#706E6B]">WUE a sa propre échelle A–G, jamais mélangée au PUE.</p>
            </div>

            <div className="bg-white border rounded p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center space-x-2">
                <span className="text-[#0176D3]">02.</span>
                <span>Chaleur fatale & EnEfG (DE)</span>
              </h3>
              <p className="text-xs text-[#444] leading-relaxed">
                Les paliers 10 / 15 / 20 % ERF sont ceux de la loi allemande EnEfG, pas un seuil UE universel.
                Ils s’affichent comme trajectoire <em>si le site est dans ce périmètre</em>.
              </p>
              <div className="bg-[#FAFAF9] p-4 rounded border space-y-2 text-xs">
                <div className="flex justify-between"><span>Objectif 2026 (EnEfG)</span><span className="font-bold text-amber-700">10 % ERF</span></div>
                <div className="flex justify-between"><span>Objectif 2027 (EnEfG)</span><span className="font-bold text-emerald-700">15 % ERF</span></div>
                <div className="flex justify-between"><span>Objectif 2028+ (EnEfG)</span><span className="font-bold text-[#0176D3]">20 % ERF</span></div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Providers>
  );
}
