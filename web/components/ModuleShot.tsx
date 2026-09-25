type Variant =
  | 'actifs' | 'capacite' | 'changement' | 'energie' | 'environnement'
  | 'puissance' | 'visualisation-3d' | 'securite' | 'analytique' | 'connectivites' | 'eed';

function Chrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_12px_32px_rgba(3,45,96,0.10)]">
      <div className="h-8 bg-[#F8FAFC] border-b border-slate-100 flex items-center gap-1.5 px-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-[10px] text-slate-400 truncate">{title}</span>
      </div>
      <div className="p-3 bg-[#FAFBFC] min-h-[168px]">{children}</div>
    </div>
  );
}

function Table({ cols, rows }: { cols: string[]; rows: string[][] }) {
  return (
    <table className="w-full text-[10px]">
      <thead>
        <tr className="text-slate-400 text-left">
          {cols.map((c) => <th key={c} className="font-medium pb-1 pr-2">{c}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-slate-100">
            {r.map((c, j) => <td key={j} className={`py-1 pr-2 ${j === 0 ? 'font-semibold text-[#032D60]' : 'text-slate-600'}`}>{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ModuleShot({ variant }: { variant: Variant }) {
  if (variant === 'actifs') {
    return (
      <Chrome title="qinode.eu / modules/actifs">
        <Table
          cols={['Asset', 'Rack', 'U', 'État']}
          rows={[
            ['srv-gpu-12', 'RACK-05', '18–21', 'Actif'],
            ['sto-nvme-03', 'RACK-05', '12–14', 'Actif'],
            ['tor-c05', 'RACK-05', '42', 'Actif'],
            ['pdu-c05-a', 'RACK-05', '—', 'Mesuré']
          ]}
        />
      </Chrome>
    );
  }
  if (variant === 'capacite') {
    return (
      <Chrome title="qinode.eu / modules/capacite">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          {[['U libres', '576'], ['kW restants', '168'], ['kg restants', '14.6 t'], ['Ports 25G', '267']].map(([k, v]) => (
            <div key={k} className="bg-white border rounded-lg p-2">
              <div className="text-[9px] uppercase text-slate-400">{k}</div>
              <div className="font-extrabold text-[#032D60] text-[16px]">{v}</div>
            </div>
          ))}
        </div>
      </Chrome>
    );
  }
  if (variant === 'changement') {
    return (
      <Chrome title="qinode.eu / modules/changement">
        <Table
          cols={['WO', 'Objet', 'État']}
          rows={[
            ['4412', 'srv-gpu-12 → R06', 'Approuvé'],
            ['4418', 'sto-nvme-03 → R08', 'Simulé'],
            ['4421', 'tor-c05 port 49', 'Revue']
          ]}
        />
      </Chrome>
    );
  }
  if (variant === 'energie') {
    return (
      <Chrome title="qinode.eu / modules/energie">
        <div className="flex items-end gap-1 h-24 px-1">
          {[40, 55, 48, 62, 70, 66, 78, 74, 82, 76, 88, 84].map((h, i) => (
            <div key={i} className="flex-1 bg-[#0176D3] rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-2 text-[10px] text-slate-500">kWh site 24 h · PUE preview 1.07</div>
      </Chrome>
    );
  }
  if (variant === 'environnement') {
    return (
      <Chrome title="qinode.eu / modules/environnement">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const hot = i === 10 || i === 11;
            return <div key={i} className={`h-7 rounded ${hot ? 'bg-orange-400' : i % 5 === 0 ? 'bg-amber-200' : 'bg-emerald-300'}`} />;
          })}
        </div>
        <div className="mt-2 text-[10px] text-slate-500">Carte thermique allée C — hotspot RACK-05</div>
      </Chrome>
    );
  }
  if (variant === 'puissance') {
    return (
      <Chrome title="qinode.eu / power">
        <Table
          cols={['Prise', 'Asset', 'kW']}
          rows={[
            ['L1-03', 'srv-gpu-12', '1.84'],
            ['L1-04', 'srv-gpu-12', '1.79'],
            ['L2-11', 'sto-nvme-03', '0.42'],
            ['L3-02', 'tor-c05', '0.18']
          ]}
        />
      </Chrome>
    );
  }
  if (variant === 'visualisation-3d') {
    return (
      <Chrome title="qinode.eu / modules/visualisation-3d">
        <div className="relative h-[132px] rounded-lg bg-[#032D60] overflow-hidden">
          <div className="absolute inset-x-6 top-6 bottom-4 grid grid-cols-8 gap-1.5">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className={`rounded-sm ${i === 5 ? 'bg-orange-400' : 'bg-white/25'}`} />
            ))}
          </div>
          <div className="absolute left-3 bottom-2 text-[9px] text-white/70">Salle B · calque thermique</div>
        </div>
      </Chrome>
    );
  }
  if (variant === 'securite') {
    return (
      <Chrome title="qinode.eu / modules/securite">
        <Table
          cols={['Acteur', 'Salle', 'Export']}
          rows={[
            ['Ops facility', 'RW', 'revue'],
            ['Tenant Orion', 'ses racks', 'son pPUE'],
            ['Auditeur', 'R', 'R figé'],
            ['Tech WO', 'allée C', 'non']
          ]}
        />
      </Chrome>
    );
  }
  if (variant === 'analytique') {
    return (
      <Chrome title="qinode.eu / modules/analytique">
        <Table
          cols={['KPI', 'J-30', 'Now']}
          rows={[
            ['PUE preview', '1.11', '1.07'],
            ['IT kW crête', '338', '364'],
            ['Headroom kW', '198', '168'],
            ['Hotspots / j', '1', '4']
          ]}
        />
      </Chrome>
    );
  }
  if (variant === 'connectivites') {
    return (
      <Chrome title="qinode.eu / modules/connectivites">
        <div className="text-[10px] space-y-1.5 font-mono text-slate-600">
          <div className="font-semibold text-[#032D60]">tor-c05:49</div>
          <div className="pl-3 border-l-2 border-[#0176D3]">srv-gpu-12:nic0 · Orion</div>
          <div className="pl-6 border-l-2 border-slate-200">app-infer-07 · critique</div>
          <div className="pl-6 border-l-2 border-amber-400">pdu-c05-a:L1-03</div>
          <div className="pl-9 text-slate-400">UPS-2 / string A</div>
        </div>
      </Chrome>
    );
  }
  return (
    <Chrome title="qinode.eu / eed">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-emerald-500 text-white grid place-items-center text-[22px] font-black">A</div>
        <div className="flex-1 space-y-1">
          {[
            ['A', 'bg-emerald-500', '88%'],
            ['B', 'bg-lime-500', '40%'],
            ['C', 'bg-yellow-400', '32%'],
            ['D', 'bg-amber-400', '24%']
          ].map(([l, c, w]) => (
            <div key={l} className="flex items-center gap-2">
              <span className={`w-5 text-center text-white text-[9px] font-bold ${c}`}>{l}</span>
              <div className="flex-1 h-1.5 bg-slate-100 rounded"><div className={`h-1.5 ${c} rounded`} style={{ width: w }} /></div>
            </div>
          ))}
        </div>
        <div className="text-right text-[10px] text-slate-500">
          <div>PUE 1.07</div><div>WUE 0.21</div><div>CUE 0.18</div>
        </div>
      </div>
    </Chrome>
  );
}
