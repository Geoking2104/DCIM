import Header from '@/components/Header';
import Providers from '@/components/Providers';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';
import ModuleShot from '@/components/ModuleShot';
import TwinDetail from '@/components/TwinDetail';
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
          <a href={home} className="hover:underline">Qinode</a><span>/</span><span>Modules</span><span>/</span>
          <span className="font-bold text-[#032D60]">{mod.title}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {MODULE_SLUGS.map((s) => {
            const m = getModule(s, locale)!;
            return (
              <a key={s} href={`${home}/modules/${s}`} className={`px-3 py-1 text-[12px] border rounded ${s === slug ? 'bg-[#0176D3] text-white border-[#0176D3]' : 'bg-white'}`}>
                {m.k} {m.title}
              </a>
            );
          })}
          <a href={`${home}/eed`} className="px-3 py-1 text-[12px] border rounded bg-[#032D60] text-white">EED</a>
        </div>
        <div className="mt-8 grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-widest text-[#0176D3]">{mod.k} • {mod.eyebrow}</div>
            <h1 className="text-[36px] leading-[1.05] font-bold mt-2">{mod.title}</h1>
            <p className="mt-4 text-[16px] text-[#444] max-w-[640px]">{mod.lead}</p>
            <ul className="mt-6 space-y-2 text-[14px]">{mod.points.map((p) => <li key={p} className="pl-4 border-l-2 border-[#0176D3]">{p}</li>)}</ul>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-2">Capture d’écran</div>
            <ModuleShot variant={shotSlug} />
          </div>
        </div>
        {slug === 'visualisation-3d' && <TwinDetail locale={locale} />}
        <div className="mt-10 rounded-xl border overflow-hidden">
          <div className="h-8 bg-[#F8FAFC] border-b flex items-center px-3 text-[10px] text-slate-400">qinode.eu / modules/{slug}</div>
          <div className="grid lg:grid-cols-[1.7fr_1fr]">
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[11px] uppercase"><tr>{mod.columns.map((c) => <th key={c} className="p-2.5 text-left">{c}</th>)}</tr></thead>
              <tbody className="divide-y">{mod.rows.map((r, i) => <tr key={i}>{r.map((cell, j) => <td key={j} className="p-2.5">{cell}</td>)}</tr>)}</tbody>
            </table>
            <div className="p-4 border-l"><h3 className="font-bold text-[14px]">{mod.asideTitle}</h3><ul className="mt-3 space-y-2 text-[13px]">{mod.aside.map((a) => <li key={a}>{a}</li>)}</ul></div>
          </div>
        </div>
        {showEed && <div className="mt-10"><EedComplianceContainer /></div>}
      </div>
    </Providers>
  );
}
