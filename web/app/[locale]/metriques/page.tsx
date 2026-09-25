import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsExplorer from '@/components/metrics/MetricsExplorer';

export const dynamic = 'force-dynamic';

export default function MetriquesPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <MetricsExplorer locale={locale} />
    </Providers>
  );
}
