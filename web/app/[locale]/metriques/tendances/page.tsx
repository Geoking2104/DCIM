import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import EnergyTrends from '@/components/metrics/EnergyTrends';

export const dynamic = 'force-dynamic';

export default function TendancesPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-6">
        <div>
          <p className="text-[11px] uppercase font-bold text-[#706E6B]">Performance</p>
          <h1 className="text-[28px] font-extrabold">Tendances énergétiques</h1>
          <p className="mt-2 text-[14px] text-slate-600 max-w-[64ch]">
            Historique ClickHouse : 1 heure (minute), 24 heures (5 min), 7 jours (heure), 30 jours (6 h).
            PUE dérivé point par point — pas un PUE de période ISO.
          </p>
        </div>
        <MetricsLinks locale={locale} current="/metriques/tendances" />
        <EnergyTrends />
      </div>
    </Providers>
  );
}
