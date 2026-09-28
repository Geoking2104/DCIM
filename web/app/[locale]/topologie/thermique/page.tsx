import ThermalOperations from '@/components/thermal/ThermalOperations';

export const metadata = {
  title: 'Jumeau thermique 3D | Qinode',
  description: 'Visualisation interactive des flux HVAC, températures et charges rack du DCIM Qinode.',
};

export default async function ThermalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ThermalOperations locale={locale} />;
}
