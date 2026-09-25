export const DISCOVERY_TOOLS = [
  {
    id: 'lldp',
    source: 'lldp-sim',
    title: 'Voisinage LLDP',
    kicker: 'Agentless',
    lead: 'Lit les voisins déclarés par le ToR et pose un lien PATCHED_TO par NIC.',
    needs: 'Switch avec LLDP TX. Ici : simulation à partir des devices du rack.',
    risk: 'N’écrase pas un lien déjà gouverné.'
  },
  {
    id: 'snmp',
    source: 'snmp-sim',
    title: 'Table SNMP ifTable',
    kicker: 'Lecture seule',
    lead: 'ifName / ifHighSpeed → ports. Pas d’écriture communauté.',
    needs: 'SNMP v2c/v3 lecture. Collecteur edge à brancher (même mutation).',
    risk: 'Preview : pas de scan du réseau de prod depuis Vercel.'
  },
  {
    id: 'redfish',
    source: 'redfish-nic',
    title: 'NIC Redfish',
    kicker: 'Serveurs',
    lead: 'EthernetInterfaces du BMC → nic0..n, puis rapprochement LLDP.',
    needs: 'BMC joignable depuis qinode-ingest (libredfish).',
    risk: 'Identifiants BMC restent dans le sidecar, pas dans le navigateur.'
  },
  {
    id: 'csv',
    source: 'csv-patch',
    title: 'Import brassage',
    kicker: 'Réconciliation',
    lead: 'Fichier port_a,port_b → liens documentés (via=csv-patch).',
    needs: 'Export tableur existant.',
    risk: 'Idempotent. Les lignes inconnues créent le port, jamais un device.'
  }
] as const;
