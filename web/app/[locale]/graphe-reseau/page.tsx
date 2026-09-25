import { Suspense } from 'react';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import NetworkGraph from '@/components/network/NetworkGraph';

export const dynamic = 'force-dynamic';

export default function GrapheReseauPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <Suspense fallback={<p className="px-6 py-8 text-[13px]">Chargement du graphe…</p>}>
        <NetworkGraph locale={locale} />
      </Suspense>
    </Providers>
  );
}
