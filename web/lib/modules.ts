export const MODULE_SLUGS = [
  'actifs',
  'capacite',
  'changement',
  'energie',
  'environnement',
  'puissance',
  'visualisation-3d',
  'securite',
  'analytique',
  'connectivites'
] as const;

export type ModuleSlug = (typeof MODULE_SLUGS)[number];

export type ModuleCopy = {
  k: string;
  title: string;
  eyebrow: string;
  lead: string;
  points: string[];
  panelTitle: string;
  columns: string[];
  rows: string[][];
  asideTitle: string;
  aside: string[];
  query: string;
};

export const MODULES_FR: Record<ModuleSlug, ModuleCopy> = {
  actifs: {
    k: '01',
    title: 'Gestion des actifs',
    eyebrow: 'Inventaire vivant',
    lead: 'Vues précises et temps réel de l’ensemble du site : serveurs, stockage, réseau, PDU de rack, panneaux de brassage et applications. Cartographiez les relations physiques jusqu’au niveau du port.',
    points: [
      'Une fiche asset = identité, U de départ, hauteur, propriétaire, contrat, ports.',
      'Relations physiques : device → rack → salle → site, et device → port → panneau.',
      'Applications et tenants rattachés à l’équipement, pas à un tableur.',
      'Découverte agentless (Redfish, SNMP, LLDP) reconcilée avec l’inventaire gouverné.'
    ],
    panelTitle: 'Inventaire salle PAR-1 / Allée C',
    columns: ['Asset', 'Type', 'Rack', 'U', 'Ports', 'État'],
    rows: [
      ['srv-gpu-12', 'Serveur', 'RACK-05', '18–21', '2×25G', 'Actif'],
      ['sto-nvme-03', 'Stockage', 'RACK-05', '12–14', '4×10G', 'Actif'],
      ['tor-c05', 'Switch', 'RACK-05', '42', '48+6', 'Actif'],
      ['pdu-c05-a', 'PDU rack', 'RACK-05', '—', '24 prises', 'Actif'],
      ['pp-c05-1', 'Brassage', 'RACK-05', '40–41', '24 cuivre', 'Documenté']
    ],
    asideTitle: 'Graphe CSoT',
    aside: [
      '(:Device)-[:INSTALLED_IN]->(:Rack)',
      '(:Device)-[:HAS_PORT]->(:Port)',
      '(:Port)-[:PATCHED_TO]->(:Port)',
      '(:Application)-[:RUNS_ON]->(:Device)'
    ],
    query: 'query Assets($roomId: ID!) { room(id: $roomId) { racks { name devices { id name startU heightU ports { id speed } } } } }'
  },
  capacite: {
    k: '02',
    title: 'Gestion de la capacité',
    eyebrow: 'Sans aller-retour salle',
    lead: 'Base centralisée des connexions et capacités. Espace, poids, température, humidité, charge, puissance budgétée et ampères mesurés.',
    points: [
      'Un rack = U libres, kg restants, kW budgétés vs mesurés, ampères par phase.',
      'La pose d’un serveur simule l’impact espace / poids / power / cooling avant le mouvement.',
      'Seuils par salle et par allée, pas une moyenne campus trompeuse.',
      'Capacité réseau (ports, ± optique) alignée sur la capacité électrique.'
    ],
    panelTitle: 'Headroom PAR-1',
    columns: ['Ressource', 'Installé', 'Utilisé', 'Budget', 'Reste'],
    rows: [
      ['Espace (U)', '1 680', '1 104', '1 260', '576 U'],
      ['Poids (t)', '42.0', '27.4', '36.0', '14.6 t'],
      ['Power (kW)', '480', '312', '400', '168 kW'],
      ['Refroid. (kWth)', '520', '298', '430', '222'],
      ['Ports 25G', '768', '501', '640', '267']
    ],
    asideTitle: 'Décision placement',
    aside: [
      'RACK-06 : 11 U libres, 2.1 kW, 38 °C — OK',
      'RACK-05 : 3 U, 0.4 kW, hotspot — bloqué',
      'Règle : jamais > 80 % d’une phase PDU'
    ],
    query: 'query Capacity($siteId: ID!) { site(id: $siteId) { rooms { racks { heightU usedU budgetKw measuredKw } } } }'
  },
  changement: {
    k: '03',
    title: 'Gestion du changement',
    eyebrow: 'Mouvements gouvernés',
    lead: 'Demandes de changement, déplacements d’appareils automatisés, piste d’audit complète des bons de travail pour la conformité et la productivité des équipes.',
    points: [
      'Un ticket = source, cible, fenêtre, impact blast-radius, approbateurs.',
      'Le graphe refuse un move si U, poids ou prise sont insuffisants.',
      'Chaque bon de travail laisse une trace immuable (qui, quand, avant/après).',
      'Les techniciens terrain voient le rack cible, pas tout le tenant.'
    ],
    panelTitle: 'File des changements — semaine 39',
    columns: ['WO', 'Objet', 'De → Vers', 'Fenêtre', 'État'],
    rows: [
      ['WO-4412', 'srv-gpu-12', 'R05 U18 → R06 U10', '26/09 02:00', 'Approuvé'],
      ['WO-4418', 'sto-nvme-03', 'R05 U12 → R08 U20', '27/09 01:00', 'Simulation OK'],
      ['WO-4421', 'tor-c05 QSFP', 'port 49 → 51', '28/09 23:00', 'En revue'],
      ['WO-4424', 'Décom. R02', 'RACK-02 → stock', '30/09', 'Brouillon']
    ],
    asideTitle: 'Audit',
    aside: [
      'WO-4412 validé par ops + énergie',
      'Snapshot topologie avant/après conservé',
      'Aucun écrasement silencieux de l’inventaire'
    ],
    query: 'mutation Move($input: MoveDeviceInput!) { moveDevice(input: $input) { workOrderId blastRadius { id } } }'
  },
  energie: {
    k: '04',
    title: 'Gestion de l’énergie',
    eyebrow: 'Où ça se consomme',
    lead: 'Comprendre où l’énergie est consommée et où économiser. Compteurs bâtiment, onduleurs, PDU d’étage, busways et PDU de rack intelligents. Graphiques ASHRAE intégrés.',
    points: [
      'PUE interne = preview non officiel, version de formule datée.',
      'Chaîne : compteur bâtiment → UPS → PDU étage → busway → PDU rack.',
      'Courbes ASHRAE pour décider si on peut remonter le setpoint.',
      'Chaque kWh porte source, unité, qualité et périmètre.'
    ],
    panelTitle: 'Répartition 24 h — PAR-1',
    columns: ['Nœud', 'kWh', '% site', 'Qualité', 'Tendance'],
    rows: [
      ['Compteur bâtiment', '7 920', '100 %', 'Mesuré', 'stable'],
      ['IT (PDU racks)', '7 410', '93.6 %', 'Mesuré', '-1.2 %'],
      ['Refroidissement', '410', '5.2 %', 'Alloc.', 'baisse'],
      ['Autres utilities', '100', '1.3 %', 'Estimé', 'stable']
    ],
    asideTitle: 'ASHRAE',
    aside: [
      'Allée C : 27.4 °C intake — classe A1 OK',
      'RACK-05 : 32.1 °C — hors envelope recommandé',
      'PUE preview 1.07 — official=false'
    ],
    query: 'query Energy($period: Period!) { siteEnergy(period: $period) { eDc eIt pue { value official formulaVersion } } }'
  },
  environnement: {
    k: '05',
    title: 'Gestion de l’environnement',
    eyebrow: 'Climat IT',
    lead: 'Identifier les points chauds, maintenir un climat optimal pour l’IT et réduire l’énergie de refroidissement sans compromettre la sécurité des équipements.',
    points: [
      'Capteurs T/φ par allée froide / chaude, pas un seul thermostat salle.',
      'Hotspot = écart à la moyenne de rangée + rate-of-change, pas un seuil magique.',
      'Liquid cooling : ΔT, débit, ΔP, conductivité, fuites.',
      'Le graphe dit quels tenants sont dans le souffle d’un CDU en alarme.'
    ],
    panelTitle: 'Points chauds — live',
    columns: ['Zone', 'T intake', 'Δ vs rangée', 'φ', 'Statut'],
    rows: [
      ['Allée A', '24.1 °C', '+0.4', '38 %', 'Nominal'],
      ['Allée B', '25.0 °C', '+0.8', '41 %', 'Nominal'],
      ['RACK-05 face', '32.1 °C', '+6.8', '29 %', 'Hotspot'],
      ['CDU-2 retour', '38.4 °C', 'ΔT 8.2', '—', 'Watch']
    ],
    asideTitle: 'Actions',
    aside: [
      'Fermer les U vides RACK-05',
      'Vérifier dalle allée C',
      'Ne pas baisser le chilled water « au cas où »'
    ],
    query: 'query Thermal($roomId: ID!) { thermalTiles(roomId: $roomId) { rackId tIn tOut humidity alarm } }'
  },
  puissance: {
    k: '06',
    title: 'Gestion de la puissance',
    eyebrow: 'Jusqu’à la prise',
    lead: 'Suivez la puissance à tout instant, jusqu’au serveur, avec prise de mesure individuelle. Historisation et dashboards pour décider, pas seulement observer.',
    points: [
      'Mesure par prise sur PDU intelligents, agrégée rack → PDU → UPS → grid.',
      'Historique ClickHouse : décider un move à 02:00, pas deviner.',
      'Déséquilibre de phase et facteur de puissance visibles avant le disjoncteur.',
      'Page dédiée /power pour la chaîne grid → cellule.'
    ],
    panelTitle: 'Prises RACK-05 / PDU-A',
    columns: ['Prise', 'Asset', 'kW', 'A', 'Facteur'],
    rows: [
      ['L1-03', 'srv-gpu-12', '1.84', '8.1', '0.98'],
      ['L1-04', 'srv-gpu-12', '1.79', '7.9', '0.98'],
      ['L2-11', 'sto-nvme-03', '0.42', '1.9', '0.95'],
      ['L3-02', 'tor-c05', '0.18', '0.9', '0.91'],
      ['—', 'Libre ×20', '0.00', '0.0', '—']
    ],
    asideTitle: 'Chaîne',
    aside: [
      'Grid 1.24 MW → UPS 1.18 → PDU 0.31 → rack',
      'Phase L1 à 78 % — ne plus poser de GPU ici',
      'Série temporelle 7 jours disponible'
    ],
    query: 'query Outlets($pduId: ID!) { pdu(id: $pduId) { outlets { id deviceKw amps pf } } }'
  },
  'visualisation-3d': {
    k: '07',
    title: 'Jumeau numérique',
    eyebrow: 'Du sol à l’U',
    lead: 'Vue aérienne du sol jusqu’aux appareils d’une armoire. Chemins électriques, boucles liquid cooling et cartes thermiques dans un seul jumeau.',
    points: [
      'WebGL charge la pièce courante, pas les 12 k nœuds du campus.',
      'LOD : salle → allée → armoire → device.',
      'Calques : thermal, power, cooling, alarmes, tenants.',
      'WebXR plus tard : QR rack + fallback 2D si tracking faible.'
    ],
    panelTitle: 'Scène PAR-1 / salle 02 — calque Thermal',
    columns: ['Objet', 'LOD', 'Calque', 'Source', 'Statut'],
    rows: [
      ['Dalle salle', 'Salle', 'Géom.', 'Room.widthM', 'Procédural'],
      ['Rangée C', 'Allée', 'Thermal', 'ClickHouse tile', 'Hotspot C05'],
      ['RACK-05', 'Armoire', 'Power', 'GraphQL rack', '78 % L1'],
      ['srv-gpu-12', 'U 18–21', 'Asset', 'startU/heightU', 'Sélectionné'],
      ['CDU-2 loop', 'Salle', 'Cooling', 'CoolingLoop', 'Nominal']
    ],
    asideTitle: 'Rendu',
    aside: [
      'InstancedMesh racks, pas 200 draw calls',
      'Subscription rackUpdated → teinte',
      'Canvas dynamiquement importé (SSR off)'
    ],
    query: 'query RoomTwin($id: ID!) { room(id: $id) { racks { id xM yM heightU devices { startU heightU } } } }'
  },
  securite: {
    k: '08',
    title: 'Accès et multi-tenant',
    eyebrow: 'Périmètres',
    lead: 'Zones, permissions granulaires par rôle, flux de surveillance et rapports temps réel pour garder l’information entre de bonnes mains.',
    points: [
      'Rôles : plateforme, exploitant, énergie, auditeur, tenant, technicien.',
      'Un tenant ne lit ni la topologie, ni la télémétrie, ni le contexte IA d’un autre.',
      'Actions privilégiées : step-up auth.',
      'Journaux d’accès exploitables par l’auditeur, non modifiables par l’ops.'
    ],
    panelTitle: 'Matrice d’accès — salle 02',
    columns: ['Acteur', 'Salle', 'Rack', 'Télémétrie', 'Export'],
    rows: [
      ['Ops facility', 'RW', 'RW', 'RW', 'soumis revue'],
      ['Tenant Orion', 'non', 'ses racks', 'ses compteurs', 'son pPUE'],
      ['Auditeur', 'R', 'R', 'R', 'R figé'],
      ['Tech WO-4412', 'allée C', 'R05–R06', 'non', 'non']
    ],
    asideTitle: 'Contrôles',
    aside: [
      'OIDC + ABAC tenant + asset',
      'Subscriptions filtrées côté serveur',
      'Aucun secret dans les artefacts d’export'
    ],
    query: 'query Whoami { me { roles tenantScope assetScope } }'
  },
  analytique: {
    k: '09',
    title: 'BI & Analytique',
    eyebrow: 'Décider avant l’incident',
    lead: 'Tableaux de bord et rapports interactifs pour découvrir des tendances de charge, de PUE et de capacité — et agir avant l’incident.',
    points: [
      'PUE / WUE / charge / headroom en séries, pas en capture d’écran.',
      'Chaque point de courbe relie la formule, la période et la couverture capteurs.',
      'Alertes sur tendance (dérive 7 j) plus que sur un spike isolé.',
      'Exports destinés à un revue humaine, pas à un label officiel généré ici.'
    ],
    panelTitle: 'Signaux 30 jours',
    columns: ['Indicateur', 'J-30', 'J-7', 'Now', 'Signal'],
    rows: [
      ['PUE preview', '1.11', '1.09', '1.07', 'amélioration'],
      ['IT kW crête', '338', '351', '364', 'hausse'],
      ['Headroom kW', '198', '176', '168', 'serrage'],
      ['Hotspots / j', '1', '3', '4', 'allée C']
    ],
    asideTitle: 'Lecture',
    aside: [
      'Charge IT monte plus vite que le headroom',
      'Action : geler les poses GPU allée C',
      'Preview ≠ label EU officiel'
    ],
    query: 'query Kpis($from: DateTime!, $to: DateTime!) { kpis(from: $from, to: $to) { pue itKw headroomKw hotspots } }'
  },
  connectivites: {
    k: '10',
    title: 'Chaîne réseau et électrique',
    eyebrow: 'Recherche d’impacts',
    lead: 'Visualisation synoptique de toute la chaîne. Recherche d’impacts en un clic : un port, un PDU, un rack, un locataire.',
    points: [
      'Un clic sur le port 49 de tor-c05 liste les apps, le tenant et la prise PDU.',
      'Un clic sur PDU-A liste les racks, phases et serveurs aval.',
      'Blast-radius cooling et power dans la même traversée.',
      'Le synoptique est une vue du graphe, pas un visio déconnecté.'
    ],
    panelTitle: 'Impact — port tor-c05 / 49',
    columns: ['Hop', 'Nœud', 'Type', 'Tenant', 'Critique'],
    rows: [
      ['0', 'tor-c05:49', 'Port 25G', 'Orion', 'oui'],
      ['1', 'srv-gpu-12:nic0', 'NIC', 'Orion', 'oui'],
      ['2', 'app-infer-07', 'Application', 'Orion', 'oui'],
      ['2', 'pdu-c05-a:L1-03', 'Prise', 'shared', 'oui'],
      ['3', 'UPS-2 / string A', 'PowerPath', 'site', 'oui']
    ],
    asideTitle: 'Si ce port tombe',
    aside: [
      '1 application GPU tenant Orion',
      'Pas de chemin réseau redondant documenté',
      'Power path reste sur UPS-2'
    ],
    query: 'query Impact($id: ID!) { blastRadius(id: $id) { nodes { id kind tenant critical } } }'
  }
};

export const MODULES_EN: Record<ModuleSlug, ModuleCopy> = {
  actifs: {
    k: '01', title: 'Asset management', eyebrow: 'Live inventory',
    lead: 'Accurate, real-time views of the whole site: servers, storage, network, rack PDUs, patch panels and applications. Map physical relationships down to the port.',
    points: ['One asset record = identity, start U, height, owner, contract, ports.', 'Physical relations down to the port.', 'Applications and tenants hang off the device, not a spreadsheet.', 'Agentless discovery reconciled with the governed inventory.'],
    panelTitle: 'Inventory PAR-1 / Aisle C', columns: ['Asset', 'Type', 'Rack', 'U', 'Ports', 'State'],
    rows: [['srv-gpu-12', 'Server', 'RACK-05', '18–21', '2×25G', 'Active'], ['sto-nvme-03', 'Storage', 'RACK-05', '12–14', '4×10G', 'Active'], ['tor-c05', 'Switch', 'RACK-05', '42', '48+6', 'Active'], ['pdu-c05-a', 'Rack PDU', 'RACK-05', '—', '24 outlets', 'Active'], ['pp-c05-1', 'Patch', 'RACK-05', '40–41', '24 copper', 'Documented']],
    asideTitle: 'CSoT graph', aside: ['(:Device)-[:INSTALLED_IN]->(:Rack)', '(:Port)-[:PATCHED_TO]->(:Port)'],
    query: 'query Assets($roomId: ID!) { room(id: $roomId) { racks { devices { name startU ports { id } } } } }'
  },
  capacite: {
    k: '02', title: 'Capacity management', eyebrow: 'No floor walks',
    lead: 'A single database of connections and capacity. Space, weight, temperature, humidity, load, budgeted power and measured amps.',
    points: ['One rack = free U, remaining kg, budgeted vs measured kW.', 'Placing a server simulates space / weight / power / cooling first.', 'Thresholds per room and aisle.', 'Network ports aligned with electrical headroom.'],
    panelTitle: 'Headroom PAR-1', columns: ['Resource', 'Installed', 'Used', 'Budget', 'Left'],
    rows: [['Space (U)', '1,680', '1,104', '1,260', '576 U'], ['Weight (t)', '42.0', '27.4', '36.0', '14.6 t'], ['Power (kW)', '480', '312', '400', '168 kW'], ['Cooling (kWth)', '520', '298', '430', '222'], ['25G ports', '768', '501', '640', '267']],
    asideTitle: 'Placement', aside: ['RACK-06: 11 U, 2.1 kW — OK', 'RACK-05: hotspot — blocked'],
    query: 'query Capacity($siteId: ID!) { site(id: $siteId) { rooms { racks { usedU budgetKw } } } }'
  },
  changement: {
    k: '03', title: 'Change management', eyebrow: 'Governed moves',
    lead: 'Change requests, automated device moves and a full audit trail of work orders.',
    points: ['A ticket carries source, target, window, blast radius, approvers.', 'The graph rejects a move when U, weight or outlet is missing.', 'Immutable before/after snapshots.', 'Field techs see the target rack only.'],
    panelTitle: 'Change queue — week 39', columns: ['WO', 'Object', 'From → To', 'Window', 'State'],
    rows: [['WO-4412', 'srv-gpu-12', 'R05 U18 → R06 U10', '26/09 02:00', 'Approved'], ['WO-4418', 'sto-nvme-03', 'R05 → R08', '27/09 01:00', 'Simulated'], ['WO-4421', 'tor-c05 QSFP', 'port 49 → 51', '28/09 23:00', 'Review']],
    asideTitle: 'Audit', aside: ['WO-4412 signed by ops + energy', 'Topology snapshot retained'],
    query: 'mutation Move($input: MoveDeviceInput!) { moveDevice(input: $input) { workOrderId } }'
  },
  energie: {
    k: '04', title: 'Energy management', eyebrow: 'Where it is consumed',
    lead: 'See how energy is consumed and where to save. Building meters, UPS, floor PDUs, busways and intelligent rack PDUs. Built-in ASHRAE charts.',
    points: ['Internal PUE is a non-official preview with a dated formula.', 'Chain from building meter to rack PDU.', 'ASHRAE curves before touching setpoints.', 'Every kWh keeps source, unit, quality and boundary.'],
    panelTitle: '24 h split — PAR-1', columns: ['Node', 'kWh', '% site', 'Quality', 'Trend'],
    rows: [['Building meter', '7,920', '100%', 'Metered', 'flat'], ['IT (rack PDUs)', '7,410', '93.6%', 'Metered', '-1.2%'], ['Cooling', '410', '5.2%', 'Allocated', 'down']],
    asideTitle: 'ASHRAE', aside: ['Aisle C 27.4 °C — A1 OK', 'RACK-05 32.1 °C — watch', 'PUE preview 1.07 — official=false'],
    query: 'query Energy($period: Period!) { siteEnergy(period: $period) { eDc eIt pue { value official } } }'
  },
  environnement: {
    k: '05', title: 'Environmental management', eyebrow: 'IT climate',
    lead: 'Spot hotspots, keep an optimal climate for IT and cut cooling energy without putting equipment at risk.',
    points: ['Intake/out sensors per aisle, not one room thermostat.', 'Hotspot = deviation + rate of change.', 'Liquid cooling: ΔT, flow, ΔP, conductivity, leaks.', 'The graph names tenants on a failing CDU.'],
    panelTitle: 'Hotspots — live', columns: ['Zone', 'T intake', 'Δ vs row', 'RH', 'Status'],
    rows: [['Aisle A', '24.1 °C', '+0.4', '38%', 'Nominal'], ['RACK-05 face', '32.1 °C', '+6.8', '29%', 'Hotspot'], ['CDU-2 return', '38.4 °C', 'ΔT 8.2', '—', 'Watch']],
    asideTitle: 'Actions', aside: ['Blank U in RACK-05', 'Check floor tiles aisle C'],
    query: 'query Thermal($roomId: ID!) { thermalTiles(roomId: $roomId) { rackId tIn alarm } }'
  },
  puissance: {
    k: '06', title: 'Power management', eyebrow: 'Down to the outlet',
    lead: 'Track power at any moment, down to the individual server with per-outlet metering.',
    points: ['Per-outlet metering rolled up to the grid.', 'ClickHouse history to schedule a 02:00 move.', 'Phase imbalance visible before the breaker.', 'Dedicated /power page for grid → cell.'],
    panelTitle: 'Outlets RACK-05 / PDU-A', columns: ['Outlet', 'Asset', 'kW', 'A', 'PF'],
    rows: [['L1-03', 'srv-gpu-12', '1.84', '8.1', '0.98'], ['L2-11', 'sto-nvme-03', '0.42', '1.9', '0.95'], ['L3-02', 'tor-c05', '0.18', '0.9', '0.91']],
    asideTitle: 'Chain', aside: ['Grid 1.24 MW → UPS 1.18 → PDU 0.31', 'Phase L1 at 78%'],
    query: 'query Outlets($pduId: ID!) { pdu(id: $pduId) { outlets { id deviceKw } } }'
  },
  'visualisation-3d': {
    k: '07', title: 'Digital twin', eyebrow: 'Floor to U',
    lead: 'Aerial floor view down to devices in a cabinet. Power paths, liquid loops and thermal maps in one twin.',
    points: ['WebGL loads the current room, not the campus graph.', 'LOD: hall → aisle → cabinet → device.', 'Layers: thermal, power, cooling, alarms, tenants.', 'WebXR later: rack QR + 2D fallback.'],
    panelTitle: 'Scene PAR-1 / room 02 — Thermal',
    columns: ['Object', 'LOD', 'Layer', 'Source', 'State'],
    rows: [['Floor', 'Hall', 'Geom.', 'Room.widthM', 'Procedural'], ['RACK-05', 'Cabinet', 'Power', 'GraphQL', '78% L1'], ['srv-gpu-12', 'U 18–21', 'Asset', 'startU', 'Selected']],
    asideTitle: 'Renderer', aside: ['InstancedMesh racks', 'rackUpdated retints', 'Dynamic canvas, SSR off'],
    query: 'query RoomTwin($id: ID!) { room(id: $id) { racks { id xM yM devices { startU } } } }'
  },
  securite: {
    k: '08', title: 'Access and multi-tenant', eyebrow: 'Perimeters',
    lead: 'Zones, granular role-based permissions, live feeds and reports so information stays in the right hands.',
    points: ['Roles: platform, operator, energy, auditor, tenant, technician.', 'No cross-tenant topology, telemetry or AI context.', 'Step-up auth on privileged actions.', 'Access logs readable by auditors, immutable to ops.'],
    panelTitle: 'Access matrix — room 02', columns: ['Actor', 'Room', 'Rack', 'Telemetry', 'Export'],
    rows: [['Facility ops', 'RW', 'RW', 'RW', 'review'], ['Tenant Orion', 'no', 'own racks', 'own meters', 'own pPUE'], ['Auditor', 'R', 'R', 'R', 'frozen']],
    asideTitle: 'Controls', aside: ['OIDC + tenant/asset ABAC', 'Server-filtered subscriptions'],
    query: 'query Whoami { me { roles tenantScope assetScope } }'
  },
  analytique: {
    k: '09', title: 'BI & Analytics', eyebrow: 'Act before the incident',
    lead: 'Interactive dashboards and reports to surface load, PUE and capacity trends.',
    points: ['PUE / WUE / load / headroom as series, not screenshots.', 'Each point cites formula, period and sensor coverage.', 'Trend alerts over isolated spikes.', 'Exports support human review, not an official EU label.'],
    panelTitle: '30-day signals', columns: ['KPI', 'D-30', 'D-7', 'Now', 'Signal'],
    rows: [['PUE preview', '1.11', '1.09', '1.07', 'improving'], ['IT peak kW', '338', '351', '364', 'up'], ['Headroom kW', '198', '176', '168', 'tightening']],
    asideTitle: 'Read', aside: ['IT load rising faster than headroom', 'Freeze GPU placements in aisle C'],
    query: 'query Kpis($from: DateTime!, $to: DateTime!) { kpis(from: $from, to: $to) { pue itKw } }'
  },
  connectivites: {
    k: '10', title: 'Network and power chain', eyebrow: 'Impact search',
    lead: 'Synoptic view of the full chain. Impact search in one click: a port, a PDU, a rack, a tenant.',
    points: ['Click port 49 → apps, tenant, PDU outlet.', 'Click PDU-A → downstream racks and phases.', 'Cooling and power blast radius in one walk.', 'The synoptic is the graph, not a disconnected drawing.'],
    panelTitle: 'Impact — tor-c05 / port 49', columns: ['Hop', 'Node', 'Kind', 'Tenant', 'Critical'],
    rows: [['0', 'tor-c05:49', '25G port', 'Orion', 'yes'], ['1', 'srv-gpu-12:nic0', 'NIC', 'Orion', 'yes'], ['2', 'app-infer-07', 'App', 'Orion', 'yes'], ['3', 'UPS-2 / A', 'PowerPath', 'site', 'yes']],
    asideTitle: 'If this port dies', aside: ['One Orion GPU app', 'No documented network redundant path'],
    query: 'query Impact($id: ID!) { blastRadius(id: $id) { nodes { id kind tenant } } }'
  }
};

export function getModule(slug: string, locale: string) {
  if (!MODULE_SLUGS.includes(slug as ModuleSlug)) return null;
  const table = locale.startsWith('en') ? MODULES_EN : MODULES_FR;
  return table[slug as ModuleSlug];
}
