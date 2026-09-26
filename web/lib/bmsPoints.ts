export type BmsPoint = {
  id: string;
  name: string;
  proto: 'BACnet' | 'Modbus';
  unit: string;
  value: number | string;
  writeable: boolean;
  status: 'ok' | 'warn' | 'fault';
};

export function sampleBmsPoints(): BmsPoint[] {
  return [
    { id: 'AHU-1.SP', name: 'CRAH-1 consigne soufflage', proto: 'BACnet', unit: '°C', value: 22.0, writeable: true, status: 'ok' },
    { id: 'AHU-1.SAT', name: 'CRAH-1 temp. soufflage', proto: 'BACnet', unit: '°C', value: 22.4, writeable: false, status: 'ok' },
    { id: 'AHU-2.SP', name: 'CRAH-2 consigne soufflage', proto: 'BACnet', unit: '°C', value: 21.5, writeable: true, status: 'ok' },
    { id: 'AHU-2.RUN', name: 'CRAH-2 marche', proto: 'BACnet', unit: '', value: 'ON', writeable: true, status: 'ok' },
    { id: 'CH-1.KW', name: 'Groupe froid 1 élec.', proto: 'Modbus', unit: 'kW', value: 186, writeable: false, status: 'ok' },
    { id: 'CH-1.SP', name: 'Eau glacée consigne', proto: 'Modbus', unit: '°C', value: 10.0, writeable: true, status: 'warn' },
    { id: 'VLV-LOOP.POS', name: 'Vanne loop CDU', proto: 'BACnet', unit: '%', value: 42, writeable: true, status: 'ok' },
    { id: 'RM.DP', name: 'Delta P allée froide', proto: 'BACnet', unit: 'Pa', value: 18, writeable: false, status: 'ok' }
  ];
}
