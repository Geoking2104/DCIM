import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';
import ModuleShot from '@/components/ModuleShot';
import { MODULE_SLUGS, getModule } from '@/lib/modules';

export default function ModulePage({ locale, slug }: { locale: string; slug: string }) {
  const mod = getModule(slug, locale);
  if (!mod) return null;
  const home = `/${locale}`;
  const showEed = slug === 'energie' || slug === 'analytique';
  const shotSlug = (['actifs','capacite','changement','energie','environnement','puissance','visualisation-3d','securite','analytique','connectivites'].includes(slug)
    ? slug
    : 'eed') as React.ComponentProps<typeof ModuleShot>['variant'];

  return (
    <Providers>
      <Header/>
      <div className="max-w-[1440px] mx-auto px-6 py-8">
        <div className="text-[11px] text-[#706E6B] flex gap-2">
          <a href={home} className="hover:underline">Qinode</a>
          <span>/</span>
          <span>Modules</span>
          <span>/</span>
          <span className="font-bold text-[#032D60]">{mod.title}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {MODULE_SLUGS.map((s) => {
            const m = getModule(s, locale)!;
            const active = s === slug;
            return (
              <a key={s} href={`${home}/modules/${s}`} className={`px-3 py-1 text-[12px] border rounded ${active ? 'bg-[#0176D3] text-white border-[#0176D3]' : 'bg-white hover:bg-[#F3F3F3]'}`}>
                {m.k} {m.title}
              </a>
            );
          })}
          <a href={`${home}/eed`} className="px-3 py-1 text-[12px] border rounded bg-[#032D60] text-white">EED 2024/1364</a>
        </div>

        <div className="mt-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-widest text-[#0176D3]">{mod.k} • {mod.eyebrow}</div>
            <h1 className="text-[36px] leading-[1.05] font-bold mt-2">{mod.title}</h1>
            <p className="mt-4 text-[16px] text-[#444] max-w-[640px]">{mod.lead}</p>
            <ul className="mt-6 space-y-2 text-[14px] text-[#032D60]">
              {mod.points.map((p) => <li key={p} className="pl-4 border-l-2 border-[#0176D3]">{p}</li>)}
            </ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Capture d’écran — interface module</div>
            <ModuleShot variant={shotSlug} />
          </div>
        </div>

        <div className="mt-10 rounded-xl border border-slate-200 overflow-hidden shadow-[0_12px_32px_rgba(3,45,96,0.08)]">
          <div className="h-8 bg-[#F8FAFC] border-b flex items-center gap-1.5 px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="ml-2 text-[10px] text-slate-400">qinode.eu / modules/{slug} — {mod.panelTitle}</span>
          </div>
          <div className="grid lg:grid-cols-[1.7fr_1fr]">
            <div className="overflow-hidden">
              <table className="w-full text-[12px]">
                <thead className="bg-[#FAFAF9] text-[11px] uppercase text-[#706E6B]">
                  <tr>{mod.columns.map((c) => <th key={c} className="p-2.5 text-left font-semibold">{c}</th>)}</tr>
                </thead>
                <tbody className="divide-y">
                  {mod.rows.map((r, i) => (
                    <tr key={i}>
                      {r.map((cell, j) => <td key={j} className={`p-2.5 ${j===0?'font-medium':''}`}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-l bg-[#FAFBFC]">
              <h3 className="font-bold text-[14px]">{mod.asideTitle}</h3>
              <ul className="mt-3 space-y-2 text-[13px] text-[#444]">
                {mod.aside.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {showEed && (
          <div className="mt-10">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Capture — tableau EED lié</div>
            <EedComplianceContainer />
          </div>
        )}
      </div>
      <footer className="border-t bg-white mt-10">
        <div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B]">© 2026 Qinode.eu • Pages illustratives — données de démonstration</div>
      </footer>
    </Providers>
  );
}
