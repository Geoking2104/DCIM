import Header from '@/components/Header';
import { MODULE_SLUGS, getModule, type ModuleSlug } from '@/lib/modules';

export default function ModulePage({ locale, slug }: { locale: string; slug: string }) {
  const mod = getModule(slug, locale);
  if (!mod) return null;
  const home = `/${locale}`;
  return (
    <>
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
        </div>
        <div className="mt-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-10">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-widest text-[#0176D3]">{mod.k} • {mod.eyebrow}</div>
            <h1 className="text-[36px] leading-[1.05] font-bold mt-2">{mod.title}</h1>
            <p className="mt-4 text-[16px] text-[#444] max-w-[640px]">{mod.lead}</p>
            <ul className="mt-6 space-y-2 text-[14px] text-[#032D60]">
              {mod.points.map((p) => <li key={p} className="pl-4 border-l-2 border-[#0176D3]">{p}</li>)}
            </ul>
            <div className="mt-8 flex gap-3">
              <a href={`${home}/power`} className="px-5 py-2.5 bg-[#0176D3] text-white rounded font-semibold text-[13px]">Supervision énergie</a>
              <a href={home} className="px-5 py-2.5 border rounded text-[13px]">Retour plateforme</a>
            </div>
          </div>
          <div className="slds-card p-4 bg-[#032D60] text-white font-mono text-[11px] overflow-auto">
            <div className="uppercase opacity-70 mb-2">GraphQL • illustratif</div>
            <pre className="whitespace-pre-wrap leading-relaxed">{mod.query}</pre>
          </div>
        </div>
        <div className="mt-10 grid lg:grid-cols-[1.7fr_1fr] gap-6">
          <div className="slds-card overflow-hidden">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-bold text-[15px]">{mod.panelTitle}</h2>
              <span className="slds-badge bg-[#FFF0C2]">Jeu de démo</span>
            </div>
            <table className="w-full text-[12px]">
              <thead className="bg-[#FAFAF9] text-[11px] uppercase text-[#706E6B]">
                <tr>{mod.columns.map((c) => <th key={c} className="p-2.5 text-left font-semibold">{c}</th>)}</tr>
              </thead>
              <tbody className="divide-y">
                {mod.rows.map((r, i) => (
                  <tr key={i} className={String(r[r.length-1]).match(/Hotspot|bloqu|Watch|serrage|hausse/i) ? 'bg-[#FFF9E6]' : ''}>
                    {r.map((cell, j) => <td key={j} className={`p-2.5 ${j===0?'font-medium':''}`}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="slds-card p-4">
            <h3 className="font-bold text-[14px]">{mod.asideTitle}</h3>
            <ul className="mt-3 space-y-2 text-[13px] text-[#444]">
              {mod.aside.map((a) => <li key={a}>{a}</li>)}
            </ul>
          </div>
        </div>
      </div>
      <footer className="border-t bg-white mt-10">
        <div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B]">© 2026 Qinode.eu • Pages illustratives — données de démonstration</div>
      </footer>
    </>
  );
}
