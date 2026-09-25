import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function EedAlias({ params }: { params: { locale?: string } }) {
  redirect(`/${params?.locale || 'fr'}/modules/conformite-eed`);
}
