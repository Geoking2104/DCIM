'use client';
import {useTranslations, useLocale} from 'next-intl';
export default function Compliance(){
  const t = useTranslations('compliance');
  const locale = useLocale();
  return (
    <section id="compliance" className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="text-[12px] font-bold tracking-widest uppercase text-[#0176D3]">Règlement (UE) 2024/1364</div>
      <h2 className="text-[28px] font-bold mt-1">{t('title')}</h2>
      <p className="mt-3 text-[14px] text-[#444] max-w-[760px]">{t('subtitle')}</p>
      <a href={`/${locale}/modules/conformite-eed`} className="inline-block mt-5 px-5 py-2.5 bg-[#0176D3] text-white rounded text-[13px] font-semibold">Ouvrir le tableau EED</a>
    </section>
  );
}
