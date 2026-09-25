import Header from '@/components/Header';
import Providers from '@/components/Providers';
import NetworkGraph from '@/components/network/NetworkGraph';

export const dynamic = 'force-dynamic';

export default function GrapheReseauPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <NetworkGraph locale={locale} />
    </Providers>
  );
}
