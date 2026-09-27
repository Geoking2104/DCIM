import { DEMO_MODE_ENABLED } from '@/lib/publicDataMode';

export default function DataModeBanner() {
  if (!DEMO_MODE_ENABLED) return null;

  return (
    <div
      role="status"
      className="border-b border-[#E4A201] bg-[#FFF4CE] px-4 py-2 text-center text-[12px] font-semibold text-[#5F4500]"
    >
      Mode démonstration actif — les données simulées sont identifiées et ne doivent pas être utilisées pour une décision opérationnelle.
    </div>
  );
}
