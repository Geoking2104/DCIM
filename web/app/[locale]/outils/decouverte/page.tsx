import Header from '@/components/Header';
import Providers from '@/components/Providers';
import DiscoveryWorkbench from '@/components/network/DiscoveryWorkbench';

export const dynamic = 'force-dynamic';

export default async function DecouvertePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Providers>
      <Header />
      <DiscoveryWorkbench locale={locale} />
    </Providers>
  );
}
