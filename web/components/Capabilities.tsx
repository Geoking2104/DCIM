'use client';
import {useTranslations} from 'next-intl';
export default function Capabilities(){
  const t = useTranslations('capabilities');
  const cards = t.raw('cards') as any[];
  return (
    <section id="plateforme" className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="text-[12px] font-bold tracking-widest uppercase text-[#0176D3]">{t('eyebrow')}</div>
      <h2 className="text-[28px] font-bold mt-1">{t('title')}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {cards.map((c:any,i:number)=>(
          <div key={i} className="slds-card p-4">
            <div className="text-[11px] font-bold uppercase text-[#706E6B]">{c.k}</div>
            <h3 className="font-bold mt-2 text-[14px]">{c.t}</h3>
            <p className="text-[12px] text-[#444] mt-2">{c.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
