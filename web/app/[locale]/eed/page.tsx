import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EedAlias({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;
  redirect(`/${locale || 'fr'}/modules/conformite-eed`);
}
