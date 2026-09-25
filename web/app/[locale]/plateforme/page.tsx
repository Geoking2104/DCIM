import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Capabilities from '@/components/Capabilities';
import LiveRacks from '@/components/LiveRacks';
import Timeline from '@/components/Timeline';
import DigitalTwin from '@/components/DigitalTwin';
import Compliance from '@/components/Compliance';
import Architecture from '@/components/Architecture';
import Providers from '@/components/Providers';
import { MODULE_SLUGS, MODULES_FR } from '@/lib/modules';

export const dynamic = 'force-dynamic';

export default function PlateformePage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Providers>
      <Header/>
      <Hero/>
      <div className="bg-[#FAFAF9] border-b">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-bold uppercase text-[11px] tracking-wide mr-2">Modules Qinode</span>
          {MODULE_SLUGS.map((slug) => (
            <a key={slug} href={`/${locale}/modules/${slug}`} className="px-3 py-1 bg-white border rounded hover:border-[#0176D3]">
              {MODULES_FR[slug].title.replace('Gestion des ', '').replace('Gestion de la ', '').replace('Gestion de l’', '').replace('Gestion du ', '')}
            </a>
          ))}
          <a href={`/${locale}/modules/conformite-eed`} className="px-3 py-1 bg-[#032D60] text-white rounded">EED 2024/1364</a>
          <a href={`/${locale}/topologie`} className="px-3 py-1 bg-[#0176D3] text-white rounded">Topologie rack</a>
        </div>
      </div>
      <Capabilities/>
      <section className="bg-white border-y">
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <LiveRacks/>
          <Timeline/>
        </div>
      </section>
      <DigitalTwin/>
      <Compliance/>
      <Architecture/>
      <footer className="border-t bg-white">
        <div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B] flex flex-wrap gap-4">
          <span>© 2026 Qinode.eu</span>
          <a href={`/${locale}`} className="underline">Accueil</a>
          <a href={`/${locale}/topologie`} className="underline">Topologie</a>
          <a href={`/${locale}/modules/conformite-eed`} className="underline">Tableau EED</a>
        </div>
      </footer>
    </Providers>
  );
}
