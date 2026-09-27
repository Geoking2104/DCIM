import '../globals.css';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import DataModeBanner from '@/components/DataModeBanner';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const messages = await getMessages();
  return (
    <html lang={locale}>
      <body className="bg-[#F3F3F3] text-[#032D60] antialiased">
        <NextIntlClientProvider messages={messages}>
          <DataModeBanner />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
