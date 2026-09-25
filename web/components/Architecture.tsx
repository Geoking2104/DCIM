'use client';
import {useTranslations} from 'next-intl';
export default function Architecture(){
  const t = useTranslations('arch');
  return (
    <section id="arch" className="max-w-[1440px] mx-auto px-6 py-12"><div className="grid lg:grid-cols-2 gap-8"><div><h2 className="text-[24px] font-bold">{t('title')}</h2><p className="text-[13px] text-[#706E6B]">{t('subtitle')}</p><div className="slds-card p-4 mt-4 font-mono text-[12px] bg-[#FAFAF9]">Devices -&gt; Edge -&gt; Redpanda -&gt; ClickHouse + Neo4j -&gt; GraphQL -&gt; WebGL + Qdrant/Ollama</div></div><div className="slds-card p-5"><div className="text-[12px] font-bold uppercase">Local infra</div><code className="block mt-4 p-3 bg-[#032D60] text-white rounded text-[12px]">docker compose up -d<br/>npm run dev</code></div></div></section>
  )
}
