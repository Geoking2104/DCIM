import Header from '@/components/Header';
import TwinDetail from '@/components/TwinDetail';
import Providers from '@/components/Providers';

export const dynamic = 'force-dynamic';

export default async function JumeauPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const engineSrc = '/twin/thermal-hvac.html';

  return (
    <Providers>
      <Header />
      <main className="bg-[#030712] text-slate-100 min-h-[calc(100vh-64px)]">
        <section className="max-w-[1440px] mx-auto px-6 py-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-cyan-400 font-semibold">
              Jumeau 3D · HVAC · laya-onnx
            </p>
            <h1 className="text-[28px] md:text-[36px] font-extrabold mt-1">
              Moteur thermique & flux HVAC
            </h1>
            <p className="mt-2 max-w-[72ch] text-[14px] text-slate-400">
              Prototype WebGL : allées froides/chaudes, boucle hydronique, heatmap volumique,
              hotspots et assistant déterministe laya-onnx. Mode démo — pas encore branché sur ClickHouse.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[12px]">
            <a href={engineSrc} target="_blank" rel="noopener" className="px-4 py-2 rounded-lg bg-cyan-600 text-white font-semibold">
              Plein écran
            </a>
            <a href="/twin/thermal-flux.html" target="_blank" rel="noopener" className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200">
              Variante flux HVAC
            </a>
            <a href={`/${locale}/topologie/thermique`} className="px-4 py-2 rounded-lg border border-cyan-700 text-cyan-300">
              Console thermique interactive
            </a>
            <a href={`/${locale}/topologie`} className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200">
              Topologie racks
            </a>
          </div>
        </section>

        <div className="border-y border-slate-800 bg-black">
          <iframe
            title="Qinode 3D Thermal HVAC Engine"
            src={engineSrc}
            className="w-full h-[78vh] border-0"
            allow="autoplay"
          />
        </div>

        <div className="max-w-[1440px] mx-auto px-6 py-10 text-slate-800 bg-[#FAFAF9]">
          <TwinDetail locale={locale} />
        </div>
      </main>
    </Providers>
  );
}
