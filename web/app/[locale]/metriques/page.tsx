import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsExplorer from '@/components/metrics/MetricsExplorer';

export const dynamic = 'force-dynamic';

export default async function MetriquesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Providers>
      <Header />
      <MetricsExplorer locale={locale} />
    </Providers>
  );
}
