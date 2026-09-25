'use client';
import {useTranslations, useLocale} from 'next-intl';
import {usePathname, useRouter} from 'next/navigation';
export default function Header(){
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const switchLocale = (newLocale:string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-[1440px] mx-auto px-6 h-[64px] flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-black text-[20px]"><span className="w-8 h-8 bg-[#0176D3] rounded text-white flex items-center justify-center">Q</span>QINODE<span className="font-light">.eu</span></div>
          <nav className="hidden lg:flex gap-1 text-[13px] font-medium">
            <a href="#plateforme" className="px-3 py-2 bg-[#F3F3F3] rounded">{t('platform')}</a>
            <a href="#compliance" className="px-3 py-2 hover:bg-[#F3F3F3] rounded">{t('compliance')}</a>
            <a href="#twin" className="px-3 py-2 hover:bg-[#F3F3F3] rounded">{t('twin')}</a>
            <a href="#arch" className="px-3 py-2 hover:bg-[#F3F3F3] rounded">{t('arch')}</a>
            <a href={`/${locale}/power`} className="px-3 py-2 hover:bg-[#F3F3F3] rounded">{t('power')}</a>
          </nav>
        </div>
        <div className="flex gap-2 items-center">
          <select value={locale} onChange={e=>switchLocale(e.target.value)} className="text-[12px] border rounded px-2 py-1.5"><option value="fr">FR</option><option value="en">EN</option></select>
          <button className="px-4 py-2 border rounded text-[13px] hidden md:block">{t('whitepaper')}</button>
          <button className="px-4 py-2 bg-[#0176D3] text-white rounded text-[13px] font-semibold">{t('demo')}</button>
        </div>
      </div>
      <div className="bg-[#032D60] text-white text-[11px]"><div className="max-w-[1440px] mx-auto px-6 py-1.5 flex justify-between"><span>QINODE.EU • SOUVERAIN • EU • AIR-GAPPED • GraphQL LIVE</span><span className="opacity-70">{process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql'}</span></div></div>
    </header>
  )
}
