import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';

export const dynamic = 'force-dynamic';

export default function EedPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'fr';
  return (
    <Providers>
      <Header />
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="text-[11px] text-[#706E6B] flex gap-2">
          <a href={`/${locale}`} className="hover:underline">Qinode</a>
          <span>/</span>
          <span className="font-bold text-[#032D60]">EED · 2024/1364</span>
        </div>
        <p className="mt-4 max-w-[760px] text-[14px] text-[#444]">
          Module illustratif calé sur le brief EED : échelle A–G PUE, ERF / chaleur fatale, WUE, CUE et export JSON.
          Qinode calcule des <strong>previews</strong>. Le label officiel et le QR sont émis par la base européenne.
        </p>
        <div className="mt-8">
          <EedComplianceContainer />
        </div>
      </div>
    </Providers>
  );
}
