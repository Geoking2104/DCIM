import MarketingHome from '@/components/MarketingHome';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MarketingHome locale={locale || 'fr'} />;
}
