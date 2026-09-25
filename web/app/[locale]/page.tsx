import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Capabilities from '@/components/Capabilities';
import LiveRacks from '@/components/LiveRacks';
import Timeline from '@/components/Timeline';
import DigitalTwin from '@/components/DigitalTwin';
import Compliance from '@/components/Compliance';
import Architecture from '@/components/Architecture';
import Providers from '@/components/Providers';

const MODULES = [
  'Actifs',
  'Capacité',
  'Changement',
  'Énergie',
  'Environnement',
  'Puissance',
  '3D',
  'Sécurité',
  'BI',
  'Connectivités'
];

export default function Page(){
  return (
    <Providers>
      <Header/>
      <Hero/>
      <div className="bg-[#FAFAF9] border-b">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="font-bold uppercase text-[11px] tracking-wide mr-2">Modules Qinode</span>
          {MODULES.map((m) => (
            <span key={m} className="px-3 py-1 bg-white border rounded">{m}</span>
          ))}
        </div>
      </div>
      <Capabilities/>
      <section className="bg-white border-y">
        <div className="max-w-[1440px] mx-auto px-6 py-8 grid lg:grid-cols-[1.8fr_1fr] gap-6">
          <LiveRacks/>
          <Timeline/>
        </div>
      </section>
      <DigitalTwin/>
      <Compliance/>
      <Architecture/>
      <footer className="border-t bg-white">
        <div className="max-w-[1440px] mx-auto px-6 py-6 text-[11px] text-[#706E6B]">
          © 2026 Qinode.eu • Supervision & opérations datacenter • FR/EN
        </div>
      </footer>
    </Providers>
  )
}
