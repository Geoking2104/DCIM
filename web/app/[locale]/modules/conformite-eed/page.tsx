import type { Metadata } from 'next';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';
import MetricsLinks from '@/components/metrics/MetricsLinks';

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
            <a href={`/${locale}/metriques`} className="hover:underline">Métriques</a>
            <span>/</span>
            <span className="text-white">Conformité EED</span>
          </div>
          <MetricsLinks locale={locale} current="/eed" />

          <div className="border-b border-slate-800 pb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-950/60 text-blue-300 border border-blue-800/50 px-3 py-1 rounded-full text-xs font-semibold mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Règlement Délégué (UE) 2024/1364</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Conformité EED & Label Énergétique Européen
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
              Module de calcul des métriques de l'Annexe III (PUE, WUE, CUE, ERF). Le label officiel reste émis par la base européenne.
            </p>
            <p className="mt-2 text-xs text-slate-500 font-mono">
              {defaultSiteName} · {defaultSiteId}
            </p>
          </div>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-200">Supervision temps réel & certification (preview)</h2>
            <EedComplianceContainer siteId={defaultSiteId} siteName={defaultSiteName} />
          </section>
        </div>
      </main>
    </Providers>
  );
}
