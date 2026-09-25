import Header from '@/components/Header';
import Providers from '@/components/Providers';
import PatchJournal from '@/components/network/PatchJournal';

export const dynamic = 'force-dynamic';

export default function JournalBrassagePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header />
      <PatchJournal locale={locale} />
    </Providers>
  );
}
