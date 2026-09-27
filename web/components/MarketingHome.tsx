'use client';
import { useState } from 'react';

const JURIS = {
  EU: { seuil: '500 kW IT', pue: 'Reporting', erf: 'Reporting', res: 'Reporting', deadline: '15 mai', amende: 'National' },
  DE: { seuil: '300 kW non redondant (EnEfG §11)', pue: 'Exist. ≤1,5 07/27 → 1,3 07/30 · neuf ≤1,2 / 2 ans', erf: '10 % 07/26 → 15 % 07/27 → 20 % 07/28', res: '100 % 01/27', deadline: '15 mai + BfEE', amende: '100 k€ §15' },
  FR: { seuil: '≥100 kW (DEE)', pue: 'Reporting + PUE France', erf: 'Reporting + Art. 26 >1 MW', res: 'Reporting', deadline: '15 mai + DEE', amende: 'Sanctions DEE' },
  AT: { seuil: 'EEffG', pue: 'Reporting', erf: 'En discussion', res: 'EEffG', deadline: 'EEffG', amende: 'EEffG' },
  ES: { seuil: '500 kW + projet PRD', pue: '≤1,15 transitoire 08/27', erf: 'Reporting', res: 'Projet', deadline: 'PRD', amende: 'Projet' },
  IE: { seuil: '500 kW UE', pue: 'SEAI', erf: 'Reporting', res: 'Reporting', deadline: '15 mai', amende: 'National' }
} as const;

type Jur = keyof typeof JURIS;

const LINKS = {
  ca: 'https://www.ca-eed.eu/energy-efficiency-directive/',
  comm: 'https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficiency-targets-directive-and-rules/energy-efficiency-directive/energy-performance-data-centres_en',
  eed: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023L1791',
  del: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1364'
};

export default function MarketingHome({ locale }: { locale: string }) {
  const [tab, setTab] = useState<Jur>('DE');
  const app = `/${locale}`;

  return (
    <div className="min-h-screen bg-[#0A0B0D] text-[#EDEEF0] selection:bg-[#C8FF2E] selection:text-black">
      <div className="sticky top-0 z-[100] bg-[#C8FF2E] text-[#0A0B0D] font-mono text-[11px] px-4 py-2 flex flex-wrap gap-3 justify-between items-center">
        <span><strong>REPORTING EED</strong> — Directive UE 2023/1791 · Règl. dél. 2024/1364</span>
        <span className="flex flex-wrap gap-3 underline">
          <a href={LINKS.ca} target="_blank" rel="noopener">ca-eed.eu</a>
          <a href={LINKS.comm} target="_blank" rel="noopener">Commission — performance DC</a>
          <a href={LINKS.eed} target="_blank" rel="noopener">2023/1791</a>
          <a href={LINKS.del} target="_blank" rel="noopener">2024/1364</a>
        </span>
      </div>

      <header className="sticky top-[36px] z-50 bg-[#0A0B0D]/90 backdrop-blur border-b border-[#232A33]">
        <div className="max-w-[1680px] mx-auto px-5 h-[56px] flex items-center justify-between">
          <a href={app} className="font-semibold tracking-[0.14em] text-[13px]">QINODE<span className="text-[#C8FF2E]">.EU</span></a>
          <nav className="hidden md:flex gap-5 font-mono text-[11px] text-[#8A8F98]">
            <a href={`/${locale}/plateforme`} className="hover:text-[#C8FF2E]">Plateforme</a>
            <a href={`/${locale}/eed`} className="hover:text-[#C8FF2E]">Dossier EED</a>
            <a href={`/${locale}/metriques`} className="hover:text-[#C8FF2E]">Métriques</a>
            <a href={`/${locale}/power`} className="hover:text-[#C8FF2E]">Puissance</a>
            <a href={`/${locale}/supervision`} className="hover:text-[#C8FF2E]">Supervision</a>
            <a href="https://github.com/Geoking2104/DCIM" target="_blank" rel="noopener" className="text-[#C8FF2E]">GitHub</a>
          </nav>
        </div>
      </header>

      <main className="max-w-[1680px] mx-auto px-5 py-10 space-y-12">
        <section>
          <p className="font-mono text-[11px] tracking-[0.18em] text-[#C8FF2E]">DCIM SOUVERAIN · SOURCE DE VÉRITÉ</p>
          <h1 className="mt-3 text-[32px] md:text-[56px] font-semibold leading-[0.9] tracking-[-0.02em]">
            Votre datacenter<br />sous contrôle. Enfin.
          </h1>
          <p className="mt-4 max-w-[60ch] font-mono text-[13px] text-[#8A8F98] leading-[1.6]">
            Inventaire, puissance, climat, jumeau, preuve EED. Snapshot immuable — pas un tableur d’allée.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`/${locale}/eed`} className="bg-[#C8FF2E] text-black px-5 py-[10px] font-mono text-[12px] font-semibold">Dossier EED →</a>
            <a href={`/${locale}/plateforme`} className="border border-[#232A33] px-5 py-[10px] font-mono text-[12px] hover:border-[#C8FF2E]">Plateforme</a>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-[1px] bg-[#232A33] border border-[#232A33]">
          <div className="bg-[#0A0B0D] p-6">
            <div className="font-mono text-[11px] tracking-[0.12em] text-[#C8FF2E] mb-4">FORMULES OFFICIELLES</div>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="border border-[#232A33] p-3"><div className="text-[#8A8F98]">PUE = EDC / EIT</div><div className="text-[10px] text-[#5A616C] mt-1">Énergie totale / IT. DE exist. ≤1,5 (07/27) → 1,3 (07/30)</div></div>
              <div className="border border-[#232A33] p-3"><div className="text-[#8A8F98]">WUE = WIN / EIT</div><div className="text-[10px] text-[#5A616C] mt-1">Eau entrante / IT. Projet ES ≤0,1 L/kWh</div></div>
              <div className="border border-[#232A33] p-3"><div className="text-[#8A8F98]">ERF = ER / EDC</div><div className="text-[10px] text-[#5A616C] mt-1">Chaleur réutilisée. DE 10 → 15 → 20 %</div></div>
              <div className="border border-[#232A33] p-3"><div className="text-[#8A8F98]">REF = énergie renouvelable / EIT</div><div className="text-[10px] text-[#5A616C] mt-1">DE 100 % renouvelable en 2027</div></div>
            </div>
          </div>
          <div className="bg-[#0A0B0D] p-6">
            <div className="font-mono text-[11px] tracking-[0.12em] text-[#C8FF2E] mb-4">SEUILS & ÉCHÉANCES UE</div>
            <div className="font-mono text-[11px] leading-[1.8]">
              <div className="flex justify-between border-b border-[#232A33] py-2"><span className="text-[#8A8F98]">Seuil IT UE</span><span>500 kW</span></div>
              <div className="flex justify-between border-b border-[#232A33] py-2"><span className="text-[#8A8F98]">Dépôt annuel</span><span className="text-[#C8FF2E]">15 mai</span></div>
              <div className="flex justify-between border-b border-[#232A33] py-2"><span className="text-[#8A8F98]">Référence CA</span><a className="underline" href={LINKS.ca} target="_blank" rel="noopener">ca-eed.eu</a></div>
              <div className="flex justify-between border-b border-[#232A33] py-2"><span className="text-[#8A8F98]">Art. 26 chaleur</span><span>&gt;1 MW sauf ACB</span></div>
              <div className="flex justify-between py-2"><span className="text-[#8A8F98]">Annexes</span><span>I · II · III</span></div>
            </div>
          </div>
          <div className="bg-[#0F1012] p-6">
            <div className="font-mono text-[11px] tracking-[0.12em] mb-4">ART. 26 — CHALEUR &gt;1 MW</div>
            <p className="font-mono text-[11px] text-[#8A8F98] leading-[1.6]">Obligation de valoriser la chaleur fatale, sauf analyse coûts-avantages négative. Qinode prépare l’ACB (offtakers, distance, CAPEX, gain ERF) — ce n’est pas le dépôt officiel.</p>
            <a href={`/${locale}/eed`} className="inline-block mt-4 font-mono text-[11px] text-[#C8FF2E]">Ouvrir le module EED →</a>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-baseline gap-4 mb-6">
            <h2 className="text-[26px] md:text-[40px] leading-[0.9]">EED — matrice pays</h2>
            <span className="font-mono text-[10px] px-2 py-1 bg-[#C8FF2E] text-black">ALLEMAGNE LA PLUS STRICTE</span>
          </div>
          <div className="flex flex-wrap gap-[1px] bg-[#232A33] border border-[#232A33] mb-4">
            {(Object.keys(JURIS) as Jur[]).map((k) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`font-mono text-[11px] px-5 py-3 ${tab === k ? 'bg-[#C8FF2E] text-black' : 'bg-[#0A0B0D] text-[#8A8F98]'}`}>{k}</button>
            ))}
          </div>
          <div className="overflow-x-auto border border-[#232A33]">
            <div className="min-w-[900px] font-mono text-[11px]">
              <div className="grid grid-cols-7 bg-[#0F1012] text-[#8A8F98] px-4 py-3 text-[10px]">
                <span>JURIDICTION</span><span>SEUIL</span><span>PUE</span><span>ERF</span><span>RENOUV.</span><span>DEADLINE</span><span>AMENDE</span>
              </div>
              {(Object.entries(JURIS) as [Jur, (typeof JURIS)[Jur]][]).map(([k, v]) => (
                <div key={k} className={`grid grid-cols-7 px-4 py-4 border-t border-[#232A33] ${tab === k ? 'bg-[#C8FF2E]/5' : ''}`}>
                  <span className={k === 'DE' ? 'text-[#C8FF2E]' : ''}>{k}</span>
                  <span className="text-[#8A8F98] pr-2">{v.seuil}</span>
                  <span className="pr-2">{v.pue}</span>
                  <span className="pr-2">{v.erf}</span>
                  <span className="pr-2">{v.res}</span>
                  <span className="pr-2">{v.deadline}</span>
                  <span>{v.amende}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] text-[#5A616C]">
            Sources :{' '}
            <a className="underline text-[#8A8F98]" href={LINKS.ca} target="_blank" rel="noopener">CA EED</a>
            {' · '}
            <a className="underline text-[#8A8F98]" href={LINKS.comm} target="_blank" rel="noopener">Commission</a>
            {' · '}transpositions nationales (EnEfG, DEE). Qinode n’est pas le registre européen.
          </p>
        </section>

        <section className="border border-[#C8FF2E] bg-[#C8FF2E] text-black p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[12px] font-semibold">QINODE DCIM — preuve versionnée, pas un tableur.</div>
          <div className="flex gap-2">
            <a href={`/${locale}/eed`} className="font-mono text-[11px] px-4 py-2 border border-black hover:bg-black hover:text-[#C8FF2E]">Reporting EED</a>
            <a href="https://github.com/Geoking2104/DCIM" target="_blank" rel="noopener" className="font-mono text-[11px] px-4 py-2 bg-black text-[#C8FF2E]">GitHub</a>
          </div>
        </section>
      </main>
    </div>
  );
}
