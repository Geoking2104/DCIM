import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Capabilities from '@/components/Capabilities';
import LiveRacks from '@/components/LiveRacks';
import Timeline from '@/components/Timeline';
import DigitalTwin from '@/components/DigitalTwin';
import Compliance from '@/components/Compliance';
import Architecture from '@/components/Architecture';
import Providers from '@/components/Providers';
export default function Page(){
  return (
    <Providers>
      <Header/>
      <Hero/>
      <div className="bg-[#FAFAF9] border-b"><div className="max-w-[1440px] mx-auto px-6 py-3 flex gap-6 text-[12px]"><span className="font-bold uppercase text-[11px]">Remplace Straton:</span><span className="px-3 py-1 bg-white border rounded">Sunbird</span><span className="px-3 py-1 bg-white border rounded">Schneider</span><span className="px-3 py-1 bg-white border rounded">NetBox/OpenDCIM</span></div></div>
      <Capabilities/>
      <section className="bg-white border-y"><div className="max-w-[1440px] mx-auto px-6 py-8 grid lg:grid-cols-[1.8fr_1fr] gap-6"><LiveRacks/><Timeline/></div></section>
      <DigitalTwin/>
      <Compliance/>
      <Architecture/>
      <footer className="border-t bg-white"><div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B]">© 2026 Qinode.eu • GraphQL Live • i18n FR/EN • SLDS</div></footer>
    </Providers>
  )
}
