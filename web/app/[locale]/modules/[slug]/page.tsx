import { notFound } from 'next/navigation';
import ModulePage from '@/components/ModulePage';
import { MODULE_SLUGS, getModule } from '@/lib/modules';

export function generateStaticParams() {
  return MODULE_SLUGS.map((slug) => ({ slug }));
}

export default function Page({
  params: { locale, slug }
}: {
  params: { locale: string; slug: string };
}) {
  if (!getModule(slug, locale)) notFound();
  return <ModulePage locale={locale} slug={slug} />;
}
