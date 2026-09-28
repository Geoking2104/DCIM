export type RackTelemetry = {
  id: string;
  row: 'A' | 'B' | 'C';
  loadPct: number;
  powerKw: number;
  intakeTemp: number;
  exhaustTemp: number;
  x: number;
  z: number;
};

const ROW_Z: Record<RackTelemetry['row'], number> = {
  A: -5,
  B: 0,
  C: 5,
};

export function rackFromLoad(
  id: string,
  row: RackTelemetry['row'],
  x: number,
  loadPct: number,
): RackTelemetry {
  const boundedLoad = Math.max(10, Math.min(100, Math.round(loadPct)));
  const intakeTemp = 17.8 + boundedLoad * 0.027;
  const exhaustTemp = intakeTemp + 6.2 + boundedLoad * 0.09;
  return {
    id,
    row,
    loadPct: boundedLoad,
    powerKw: Number((boundedLoad * 0.12).toFixed(1)),
    intakeTemp: Number(intakeTemp.toFixed(1)),
    exhaustTemp: Number(exhaustTemp.toFixed(1)),
    x,
    z: ROW_Z[row],
  };
}

export function createInitialRacks(): RackTelemetry[] {
  const loads = [54, 62, 71, 58, 67, 49, 64, 73, 57, 69, 76, 61, 52, 66, 70, 59, 74, 63];
  const positions = [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5];
  return (['A', 'B', 'C'] as const).flatMap((row, rowIndex) =>
    positions.map((x, rackIndex) =>
      rackFromLoad(
        `${row}-${String(rackIndex + 1).padStart(2, '0')}`,
        row,
        x,
        loads[rowIndex * positions.length + rackIndex],
      ),
    ),
  );
}

export function updateRackLoad(
  racks: RackTelemetry[],
  rackId: string,
  loadPct: number,
): RackTelemetry[] {
  return racks.map((rack) =>
    rack.id === rackId
      ? rackFromLoad(rack.id, rack.row, rack.x, loadPct)
      : rack,
  );
}

export function balanceRackLoads(racks: RackTelemetry[]): RackTelemetry[] {
  const average =
    racks.reduce((sum, rack) => sum + rack.loadPct, 0) / Math.max(racks.length, 1);
  return racks.map((rack, index) =>
    rackFromLoad(rack.id, rack.row, rack.x, average + ((index % 3) - 1) * 2),
  );
}

export function maxExhaustTemperature(racks: RackTelemetry[]): number {
  return Math.max(...racks.map((rack) => rack.exhaustTemp));
}
