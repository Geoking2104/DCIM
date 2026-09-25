'use client';
import {useTranslations} from 'next-intl';
export default function Compliance(){
  const t = useTranslations('compliance');
  return (
    <section id="compliance" className="bg-white border-y"><div className="max-w-[1440px] mx-auto px-6 py-12"><h2 className="text-[28px] font-bold">{t('title')}</h2><p className="text-[13px] text-[#444] mt-2 max-w-[700px]">{t('subtitle')}</p><div className="grid lg:grid-cols-3 gap-4 mt-8"><div className="slds-card p-5"><div className="font-bold uppercase text-[12px]">EU 2024/1364 + C(2026)3472</div><p className="text-[12px] mt-2">Datasets traçables PUE/WUE/ERF. Preview A-G interne.</p></div><div className="slds-card p-5"><div className="font-bold uppercase text-[12px]">Waste-Heat 10/15/20% DE</div><p className="text-[12px] mt-2">Mesure récupérable/réutilisée, policies versionnées.</p></div><div className="slds-card p-5"><div className="font-bold uppercase text-[12px]">Multi-tenant CSRD/ESRS</div><p className="text-[12px] mt-2">Allocation mesurée + overhead, partial PUE.</p></div></div></div></section>
  )
}
