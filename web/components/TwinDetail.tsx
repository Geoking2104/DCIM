const FLOWS = [
  {
    name: 'Inventaire → scène',
    steps: ['CMDB / découverte Redfish·SNMP·LLDP', 'Graphe CSoT (Device–Rack–Port)', 'GraphQL room { racks, devices }', 'Géométrie WebGL (LOD salle→U)']
  },
  {
    name: 'Télémétrie → calques',
    steps: ['PDU / capteurs Tφ / CDU', 'Ingest (MQTT / Modbus / Redfish)', 'ClickHouse séries 10 s', 'Teinte thermal / power / cooling']
  },
  {
    name: 'Live → ops',
    steps: ['subscription rackUpdated', 'Diff id + temp + kW', 'Recolor InstancedMesh', 'Alarme + blast radius graphe']
  },
  {
    name: 'Action → jumeau',
    steps: ['WO changement (move U)', 'Mutation graphe', 'Snapshot avant/après', 'Reposition device dans la scène']
  }
];

export default function TwinDetail({ locale }: { locale: string }) {
  return (
    <section className="mt-12 space-y-8">
      <div>
        <h2 className="text-[22px] font-extrabold">Flux de données du jumeau</h2>
        <p className="mt-2 text-[14px] text-slate-600 max-w-[68ch]">Quatre pipelines. Aucun fichier BIM figé : la scène lit le graphe et ClickHouse.</p>
      </div>

      <div className="rounded-2xl border bg-[#032D60] text-white p-5 overflow-x-auto">
        <div className="text-[11px] uppercase tracking-widest text-blue-200 mb-3">Synoptique</div>
        <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
          {['Terrain / PDU / CDU', 'Ingest', 'ClickHouse', 'Graphe CSoT', 'GraphQL + WS', 'WebGL LOD', 'Calques + alertes'].map((s, i) => (
            <span key={s} className="contents">
              {i > 0 && <span className="opacity-50">→</span>}
              <span className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/15">{s}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {FLOWS.map((f) => (
          <div key={f.name} className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-[15px]">{f.name}</h3>
            <ol className="mt-3 space-y-2 text-[13px] text-slate-600">
              {f.steps.map((s, i) => (
                <li key={s} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-[#E6F2FE] text-[#0176D3] text-[11px] font-bold grid place-items-center shrink-0">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      <table className="w-full text-[12px] border rounded-xl overflow-hidden">
        <thead className="bg-[#FAFAF9] text-left uppercase text-[11px] text-slate-500">
          <tr><th className="p-3">Flux</th><th className="p-3">Producteur</th><th className="p-3">Store</th><th className="p-3">Consommateur UI</th></tr>
        </thead>
        <tbody className="divide-y">
          <tr><td className="p-3 font-semibold">Topo</td><td className="p-3">Découverte + ops</td><td className="p-3">Graphe</td><td className="p-3">LOD, positions</td></tr>
          <tr><td className="p-3 font-semibold">kW / A</td><td className="p-3">PDU intelligents</td><td className="p-3">ClickHouse</td><td className="p-3">Calque power, /power</td></tr>
          <tr><td className="p-3 font-semibold">T / φ / ΔT</td><td className="p-3">Sondes + CDU</td><td className="p-3">ClickHouse</td><td className="p-3">Calque thermal</td></tr>
          <tr><td className="p-3 font-semibold">Move</td><td className="p-3">WO changement</td><td className="p-3">Graphe + audit</td><td className="p-3">Reposition U</td></tr>
        </tbody>
      </table>

      <div className="flex flex-wrap gap-2 text-[12px]">
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/modules/actifs`}>Source topo</a>
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/power`}>Source kW</a>
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/modules/environnement`}>Source T°</a>
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/modules/changement`}>Source moves</a>
      </div>
    </section>
  );
}
