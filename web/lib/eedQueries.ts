import { gql } from '@apollo/client';

export const GET_SITE_EED_COMPLIANCE = gql`
  query GetSiteEedCompliance($siteId: ID!, $period: ReportingPeriodType!) {
    getSiteEedMetrics(siteId: $siteId, period: $period) {
      siteId
      periodType
      timestampStart
      timestampEnd
      totalEnergyInputKwh
      itEquipmentEnergyKwh
      reusedHeatEnergyKwh
      totalWaterInputLiters
      totalCarbonEmissionsKgCO2e
      pue
      erf
      wue
      cue
      puePreviewLabel
      wuePreviewLabel
      officialEUEnergyLabel
      formulaVersion
    }
  }
`;

export const GENERATE_EU_EXPORT = gql`
  mutation GenerateEuDatabaseExport($siteId: ID!, $reportingYear: Int!) {
    generateEuDatabaseExport(siteId: $siteId, reportingYear: $reportingYear) {
      success
      euDatacenterID
      exportTimestamp
      payloadJson
      validationErrors
    }
  }
`;
