export default function Timeline(){
  return (
    <div>
      <h3 className="font-bold text-[16px]">AIOps • Activity Timeline</h3>
      <div className="slds-card mt-3 p-4">
        <div className="relative pl-6 border-l space-y-6">
          <div className="relative"><div className="absolute -left-[29px] top-0 w-3 h-3 bg-orange-400 rounded-full border-2 border-white"></div><div className="text-[11px] text-[#706E6B]">2m ago</div><div className="font-semibold text-[13px]">RACK-05 TEMPERATURE &gt;65°C HIGH</div></div>
          <div className="relative"><div className="absolute -left-[29px] top-0 w-3 h-3 bg-[#0176D3] rounded-full border-2 border-white"></div><div className="text-[11px] text-[#706E6B]">12m ago</div><div className="font-semibold text-[13px]">PDU-01 OPERATING NORMAL</div></div>
          <div className="relative"><div className="absolute -left-[29px] top-0 w-3 h-3 bg-[#032D60] rounded-full border-2 border-white"></div><div className="text-[11px] text-[#706E6B]">1h ago</div><div className="font-semibold text-[13px]">CDU-02 Maintenance J+7</div></div>
        </div>
      </div>
    </div>
  )
}
