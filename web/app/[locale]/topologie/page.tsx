import Header from '@/components/Header';
import Providers from '@/components/Providers';
import RackPickerHint from '@/components/topology/RackPickerHint';
import TopologyView from '@/components/topology/TopologyView';

export const dynamic = 'force-dynamic';

export default function TopologiePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <div className="max-w-[1440px] mx-auto px-6 pt-4 flex justify-between items-center">
        <RackPickerHint />
        <a href={`/${locale}/graphe-reseau`} className="text-[13px] text-[#0176D3]">Graphe réseau →</a>
      </div>
      <TopologyView />
      <footer className="border-t bg-white">
        <div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B] flex gap-4">
          <a href={`/${locale}/plateforme`} className="underline">Plateforme</a>
          <a href={`/${locale}/power`} className="underline">Puissance</a>
          <a href={`/${locale}/outils/decouverte`} className="underline">Découverte</a>
        </div>
      </footer>
    </Providers>
  );
}
