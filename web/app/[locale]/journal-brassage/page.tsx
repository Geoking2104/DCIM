import Header from '@/components/Header';
import Providers from '@/components/Providers';
import PatchJournal from '@/components/network/PatchJournal';

export const dynamic = 'force-dynamic';

export default async function JournalBrassagePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Providers>
      <Header />
      <PatchJournal locale={locale} />
    </Providers>
  );
}
