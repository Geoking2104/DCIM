import MarketingHome from '@/components/MarketingHome';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  return <MarketingHome locale={locale || 'fr'} />;
}
