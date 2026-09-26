import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import PredictiveControl from '@/components/metrics/PredictiveControl';

export const dynamic = 'force-dynamic';

export default function PredictifPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <div>
          <p className="text-[11px] uppercase font-bold text-[#706E6B]">Contrôle</p>
          <h1 className="text-[28px] font-extrabold">Contrôle prédictif</h1>
          <p className="mt-2 text-[14px] text-slate-600 max-w-[64ch]">
            Prévision 12 h à partir des 24 h ClickHouse. Actions conseillées, pas d’écriture automatique vers le BMS.
          </p>
        </div>
        <MetricsLinks locale={locale} current="/metriques/predictif" />
        <PredictiveControl />
      </div>
    </Providers>
  );
}
