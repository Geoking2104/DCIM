'use client';
import {useTranslations, useLocale} from 'next-intl';
import {MODULE_SLUGS} from '@/lib/modules';

export default function Capabilities(){
  const t = useTranslations('capabilities');
  const locale = useLocale();
  const cards = t.raw('cards') as any[];
  return (
    <section id="plateforme" className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="text-[12px] font-bold tracking-widest uppercase text-[#0176D3]">{t('eyebrow')}</div>
      <h2 className="text-[28px] font-bold mt-1">{t('title')}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {cards.map((c:any,i:number)=>{
          const slug = MODULE_SLUGS[i];
          return (
            <a key={i} href={`/${locale}/modules/${slug}`} className="slds-card p-4 hover:border-[#0176D3] transition-colors block">
              <div className="text-[11px] font-bold uppercase text-[#706E6B]">{c.k}</div>
              <h3 className="font-bold mt-2 text-[14px]">{c.t}</h3>
              <p className="text-[12px] text-[#444] mt-2">{c.d}</p>
              <div className="mt-3 text-[11px] font-semibold text-[#0176D3]">Voir le module →</div>
            </a>
          );
        })}
      </div>
    </section>
  )
}
