'use client';
import {useTranslations, useLocale} from 'next-intl';
import OptimizedImage from '@/components/OptimizedImage';
export default function Hero(){
  const t = useTranslations('hero');
  const locale = useLocale();
  return (
    <section className="bg-white border-b">
      <div className="max-w-[1440px] mx-auto px-6 py-10 grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
        <div>
          <div className="flex gap-2 mb-4">
            <span className="slds-badge bg-[#E6F2FE] text-[#0176D3] border border-[#C9E2F5]">{t('badge1')}</span>
            <span className="slds-badge bg-[#F3F3F3] border">{t('badge2')}</span>
          </div>
          <h1 className="text-[42px] leading-[0.95] font-bold tracking-tight">{t('title1')}<br/>{t('title2')}<br/><span className="text-[#0176D3]">{t('title3')}</span></h1>
          <p className="mt-4 text-[16px] text-[#444] max-w-[560px]">{t('subtitle')}</p>
          <div className="mt-6 flex gap-6 border-y py-4 text-[12px]">
            <div><div className="text-[11px] uppercase text-[#706E6B]">{t('kpi_pue')}</div><div className="text-[18px] font-bold">1.07</div></div>
            <div><div className="text-[11px] uppercase text-[#706E6B]">{t('kpi_wue')}</div><div className="text-[18px] font-bold">A</div></div>
            <div><div className="text-[11px] uppercase text-[#706E6B]">{t('kpi_cooling')}</div><div className="text-[18px] font-bold">160 L/min</div></div>
            <div><div className="text-[11px] uppercase text-[#706E6B]">{t('kpi_nodes')}</div><div className="text-[18px] font-bold">12.4k</div></div>
          </div>
          <div className="mt-6 flex gap-3">
            <a href={`/${locale}/modules/conformite-eed`} className="px-5 py-2.5 bg-[#0176D3] text-white rounded font-semibold text-[13px]">Tableau EED</a>
            <a href={`/${locale}/power`} className="px-4 py-2.5 bg-[#F3F3F3] border rounded text-[12px]">Chaîne électrique</a>
          </div>
        </div>
        <div className="relative">
          <div className="slds-card overflow-hidden">
            <OptimizedImage src="/images/img-1.svg" alt="Boucle liquid cooling — jumeau" width={720} height={380} priority className="h-[380px] w-full object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            <div className="absolute top-4 right-4 slds-card p-3 w-[220px] shadow-lg">
              <div className="text-[11px] uppercase font-bold text-[#706E6B]">DIGITAL TWIN — LIVE</div>
              <div className="mt-2 space-y-2 text-[12px]">
                <div className="flex justify-between"><span>Power Usage</span><span className="font-bold">1.24 MW</span></div>
                <div className="w-full h-1.5 bg-[#F3F3F3] rounded"><div className="h-1.5 w-[78%] bg-[#0176D3] rounded"/></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
