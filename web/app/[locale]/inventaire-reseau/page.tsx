import Header from '@/components/Header';
import Providers from '@/components/Providers';
import NetworkInventory from '@/components/network/NetworkInventory';

export const dynamic = 'force-dynamic';

export default function InventaireReseauPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <NetworkInventory />
      <footer className="border-t bg-white">
        <div className="max-w-[1100px] mx-auto px-6 py-6 text-[11px] text-[#706E6B] flex gap-4">
          <a className="underline" href={`/${locale}/topologie`}>Topologie</a>
          <a className="underline" href={`/${locale}/modules/connectivites`}>Module connectivités</a>
        </div>
      </footer>
    </Providers>
  );
}
