import Providers from '@/components/Providers';
import ModulePage from '@/components/ModulePage';
import { getModule } from '@/lib/modules';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default async function Page({
  params
}: {
  params: Promise<{ locale?: string; slug?: string }>;
}) {
  const { locale = 'fr', slug = 'actifs' } = await params;
  const mod = getModule(slug, locale);
  const safeSlug = mod ? slug : 'actifs';
  return (
    <Providers>
      <ModulePage locale={locale} slug={safeSlug} />
    </Providers>
  );
}
