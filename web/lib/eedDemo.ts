export type EUEnergyLabel = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface EedMetricsData {
  siteId: string;
  siteName: string;
  currentPue: number;
  currentWue: number;
  puePreviewLabel: EUEnergyLabel;
  wuePreviewLabel: EUEnergyLabel;
  official: false;
  formulaVersion: string;
  erfPercentage: number;
  erfTargetPercentage: number;
  erfTargetScope: string;
  reusedHeatGwh: number;
  wue: number;
  cue: number;
  euDatacenterID: string;
  isAuditVerified: boolean;
  eDcKwh: number;
  eItKwh: number;
}

export const DEMO_EED: EedMetricsData = {
  siteId: 'PAR-1',
  siteName: 'PAR-1 · salle 02',
  currentPue: 1.07,
  currentWue: 0.31,
  puePreviewLabel: 'A',
  wuePreviewLabel: 'B',
  official: false,
  formulaVersion: 'C(2026)3472-preview / ISO 30134',
  erfPercentage: 8.4,
  erfTargetPercentage: 15,
  erfTargetScope: 'EnEfG DE — pas un seuil UE universel',
  reusedHeatGwh: 0.66,
  wue: 0.31,
  cue: 0.042,
  euDatacenterID: 'EU-DC-— (non attribué)',
  isAuditVerified: false,
  eDcKwh: 7920 * 365,
  eItKwh: 7410 * 365
};
