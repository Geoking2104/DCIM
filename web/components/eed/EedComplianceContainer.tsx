'use client';

import { useQuery } from '@apollo/client';
import { GET_SITE_EED_COMPLIANCE } from '@/lib/eedQueries';
import { DEMO_EED, EedMetricsData, EUEnergyLabel } from '@/lib/eedDemo';
import EedComplianceDashboard from './EedComplianceDashboard';

export default function EedComplianceContainer({
  siteId = 'PAR-1',
  siteName = 'PAR-1 · salle 02'
}: {
  siteId?: string;
  siteName?: string;
}) {
  const { data, error } = useQuery(GET_SITE_EED_COMPLIANCE, {
    variables: { siteId, period: 'ANNUAL' },
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    ssr: false
  });

  const raw = data?.getSiteEedMetrics;
  const view: EedMetricsData = raw
    ? {
        siteId: raw.siteId,
        siteName,
        currentPue: raw.pue,
        currentWue: raw.wue,
        puePreviewLabel: (raw.puePreviewLabel || 'A') as EUEnergyLabel,
        wuePreviewLabel: (raw.wuePreviewLabel || 'B') as EUEnergyLabel,
        official: false,
        formulaVersion: raw.formulaVersion || 'preview',
        erfPercentage: (raw.erf || 0) * 100,
        erfTargetPercentage: 15,
        erfTargetScope: 'EnEfG DE — pas un seuil UE universel',
        reusedHeatGwh: (raw.reusedHeatEnergyKwh || 0) / 1_000_000,
        wue: raw.wue,
        cue: raw.cue,
        euDatacenterID: `EU-DC-${siteId}`,
        isAuditVerified: false,
        eDcKwh: raw.totalEnergyInputKwh,
        eItKwh: raw.itEquipmentEnergyKwh
      }
    : DEMO_EED;

  return (
    <div>
      {error && (
        <div className="mb-3 text-[11px] bg-[#FFF9E6] border px-3 py-2 rounded">
          GraphQL EED injoignable — affichage du jeu de démo PAR-1.
        </div>
      )}
      <EedComplianceDashboard data={view} />
    </div>
  );
}
