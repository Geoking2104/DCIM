import Providers from '@/components/Providers';
import ModulePage from '@/components/ModulePage';
import { MODULE_SLUGS, getModule } from '@/lib/modules';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function Page({
  params
}: {
  params: { locale?: string; slug?: string };
}) {
  const locale = params?.locale || 'fr';
  const slug = params?.slug || 'actifs';
  const mod = getModule(slug, locale);
  const safeSlug = mod ? slug : 'actifs';
  return (
    <Providers>
      <ModulePage locale={locale} slug={safeSlug} />
    </Providers>
  );
}
