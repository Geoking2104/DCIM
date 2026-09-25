import OptimizedImage from '@/components/OptimizedImage';

export default function DigitalTwin(){
  return (
    <section id="twin" className="max-w-[1440px] mx-auto px-6 py-12 grid lg:grid-cols-2 gap-8 items-center">
      <div className="slds-card overflow-hidden">
        <OptimizedImage src="/images/img-2.svg" alt="Jumeau thermique isométrique" width={720} height={420} className="h-[420px] w-full object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
        <div className="p-3 border-b text-[12px] flex justify-between"><span>Thermal</span><span className="bg-[#E6F2FE] px-2 rounded">ISOMETRIC</span></div>
      </div>
      <div>
        <div className="text-[12px] font-bold uppercase text-[#0176D3]">Walkthrough + Layers</div>
        <h2 className="text-[30px] font-bold mt-2">Digital Twin WebGL + AR</h2>
        <div className="mt-6 slds-card p-4 bg-[#032D60] text-white font-mono text-[12px]">subscription {'{'} rackUpdated {'{'} id temperature {'}'} {'}'}</div>
      </div>
    </section>
  )
}
