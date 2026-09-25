import Header from '@/components/Header';
import Providers from '@/components/Providers';
import DiscoveryWorkbench from '@/components/network/DiscoveryWorkbench';

export const dynamic = 'force-dynamic';

export default function DecouvertePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <DiscoveryWorkbench locale={locale} />
    </Providers>
  );
}
