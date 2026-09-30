//! Logique de détection locale pour la console PowerShield (onduleurs & cellules).
//! Fonctions pures, sans React, testables via `node --test`.

export type StringKind = 'li-ion' | 'vrla';

export type BatteryCell = {
  cell_id: string;
  rack_id?: string;
  voltage: number;
  temp: number;
  soc: number;
  status?: string;
  last_update?: string;
};

export type CellSeverity = 'ok' | 'warning' | 'critical';

export type CellAnomaly = {
  cellId: string;
  severity: 'warning' | 'critical';
  reason: string;
  voltage: number;
  temp: number;
  soc: number;
  status: string;
};

/** Tension nominale par cellule selon la technologie de chaîne. */
export const NOMINAL_VOLTAGE: Record<StringKind, number> = {
  'li-ion': 3.65,
  vrla: 2.25
};

/** Seuils de la détection locale (DyAD simplifié) — visibles dans la console. */
export const THRESHOLDS = {
  deltaVWarning: 0.25,
  deltaVCritical: 0.4,
  tempWarning: 37,
  tempCritical: 40,
  socWarning: 20
} as const;

function classify(cell: BatteryCell, kind: StringKind): CellAnomaly | null {
  const voltage = Number(cell.voltage);
  const temp = Number(cell.temp);
  const soc = Number(cell.soc);
  const status = String(cell.status || '').toLowerCase();

  let severity: 'warning' | 'critical' | null = null;
  const reasons: string[] = [];

  if (Number.isFinite(voltage)) {
    const delta = NOMINAL_VOLTAGE[kind] - voltage;
    if (delta >= THRESHOLDS.deltaVCritical) {
      severity = 'critical';
      reasons.push(`chute de tension ΔV ${delta.toFixed(2)} V`);
    } else if (delta >= THRESHOLDS.deltaVWarning) {
      severity = 'warning';
      reasons.push(`dérive de tension ΔV ${delta.toFixed(2)} V`);
    }
  }

  if (Number.isFinite(temp)) {
    if (temp >= THRESHOLDS.tempCritical) {
      severity = 'critical';
      reasons.push(`température ${temp.toFixed(1)} °C`);
    } else if (temp >= THRESHOLDS.tempWarning) {
      severity = severity ?? 'warning';
      reasons.push(`température élevée ${temp.toFixed(1)} °C`);
    }
  }

  if (Number.isFinite(soc) && soc >= 0 && soc < THRESHOLDS.socWarning) {
    severity = severity ?? 'warning';
    reasons.push(`SoC bas ${soc.toFixed(0)} %`);
  }

  if (status === 'critical' || status === 'fault' || status === 'hs') {
    severity = 'critical';
    reasons.push('signalé par la chaîne BMS');
  } else if (status === 'warning' && !severity) {
    severity = 'warning';
    reasons.push('signalé par la chaîne BMS');
  }

  if (!severity) return null;

  return {
    cellId: String(cell.cell_id || 'CELL-?'),
    severity,
    reason: reasons.join(' · ') || 'écart détecté',
    voltage: Number.isFinite(voltage) ? voltage : 0,
    temp: Number.isFinite(temp) ? temp : 0,
    soc: Number.isFinite(soc) ? soc : 0,
    status: cell.status || 'n/a'
  };
}

/** Détecte les anomalies cellule par cellule ; critiques d'abord. */
export function detectCellAnomalies(cells: BatteryCell[], kind: StringKind): CellAnomaly[] {
  const out: CellAnomaly[] = [];
  for (const cell of cells) {
    const anomaly = classify(cell, kind);
    if (anomaly) out.push(anomaly);
  }
  return out.sort((a, b) => {
    if (a.severity === b.severity) return 0;
    return a.severity === 'critical' ? -1 : 1;
  });
}

/** Anomalie la plus grave (critique prioritaire), ou null. */
export function worstAnomaly(anomalies: CellAnomaly[]): CellAnomaly | null {
  return anomalies.find((a) => a.severity === 'critical') ?? anomalies[0] ?? null;
}

export function cellSeverity(cellId: string, anomalies: CellAnomaly[]): CellSeverity {
  const found = anomalies.find((a) => a.cellId === cellId);
  return found ? found.severity : 'ok';
}

function csvCell(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/**
 * Export CSV « préparation revue IEEE 1188 » : un enregistrement par cellule,
 * avec le drapeau DyAD et l'horodatage de mesure. Destiné à une revue humaine,
 * pas à un label officiel généré automatiquement.
 */
export function buildIeeeCsv(
  stringId: string,
  kind: StringKind,
  cells: BatteryCell[],
  anomalies: CellAnomaly[],
  generatedAt: string = new Date().toISOString()
): string {
  const flags = new Map(anomalies.map((a) => [a.cellId, a]));
  const lines: string[] = [
    '# Qinode PowerShield — export cellule (préparation revue IEEE 1188)',
    `# Chaîne: ${stringId} · technologie: ${kind} · nominal: ${NOMINAL_VOLTAGE[kind]} V`,
    `# Généré: ${generatedAt} · cellules: ${cells.length} · anomalies: ${anomalies.length}`,
    ['chain', 'cell_id', 'voltage_v', 'temp_c', 'soc_pct', 'status', 'dyad_flag', 'measured_at'].join(',')
  ];
  for (const cell of cells) {
    const flag = flags.get(String(cell.cell_id));
    lines.push(
      [
        csvCell(stringId),
        csvCell(cell.cell_id),
        csvCell(cell.voltage),
        csvCell(cell.temp),
        csvCell(cell.soc),
        csvCell(cell.status || 'n/a'),
        csvCell(flag ? `${flag.severity}: ${flag.reason}` : 'ok'),
        csvCell(cell.last_update || '')
      ].join(',')
    );
  }
  return lines.join('\n');
}
