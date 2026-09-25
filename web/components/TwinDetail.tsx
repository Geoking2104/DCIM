export default function TwinDetail({ locale }: { locale: string }) {
  const blocks = [
    {
      t: 'Ce que vous voyez',
      d: 'Du dallage au U : salle, allée, armoire, device. Un seul jumeau pour les chemins électriques, les boucles liquid cooling et la carte thermique.'
    },
    {
      t: 'LOD — on ne charge pas le campus',
      d: 'Niveau 0 salle (dalle + rangées), 1 allée (racks instanciés), 2 armoire (U colorés), 3 device sélectionné. WebGL importe dynamiquement le canvas (SSR off).'
    },
    {
      t: 'Calques',
      d: 'Thermal (tuiles ClickHouse), Power (phase PDU), Cooling (débit / ΔT / fuite), Alarmes, Tenants. Un calque = une teinte, pas une deuxième scène.'
    },
    {
      t: 'Données',
      d: 'Géométrie : GraphQL room { racks { xM yM heightU devices { startU } } }. Live : subscription rackUpdated → couleur. Pas de mesh par serveur à 12 k nœuds.'
    },
    {
      t: 'Perf',
      d: 'InstancedMesh pour les racks, une salle à la fois, frustum cull. Objectif : 60 fps sur un laptop ops, pas une station 3D.'
    },
    {
      t: 'Suite',
      d: 'WebXR + QR rack pour le terrain ; fallback 2D si le tracking lâche. Le jumeau reste une vue du graphe, pas un fichier BIM déconnecté.'
    }
  ];
  return (
    <section className="mt-12 space-y-6">
      <h2 className="text-[22px] font-extrabold">Comment le jumeau est construit</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {blocks.map((b) => (
          <div key={b.t} className="border rounded-xl p-5 bg-white">
            <h3 className="font-bold text-[15px]">{b.t}</h3>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">{b.d}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 text-[12px]">
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/modules/environnement`}>Calque thermique</a>
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/power`}>Calque puissance</a>
        <a className="px-3 py-1 rounded-full bg-[#E6F2FE] text-[#0176D3] font-semibold" href={`/${locale}/modules/connectivites`}>Chemins</a>
      </div>
    </section>
  );
}
