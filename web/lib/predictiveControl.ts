export type ForecastPoint = {
  at: string;
  hour: number;
  grid_kw: number;
  rack_kw: number;
  pue: number;
  peak: boolean;
};

export type ControlAction = {
  id: string;
  when: string;
  action: string;
  why: string;
};

function hourOf(ts: string) {
  return new Date(ts).getHours();
}

export function forecastControl(
  rows: { timestamp: string; grid_kw: number; rack_kw: number }[],
  horizon = 12
): { forecast: ForecastPoint[]; actions: ControlAction[]; model: string } {
  if (rows.length < 4) {
    return { forecast: [], actions: [], model: 'insuffisant' };
  }
  const byHour: Record<number, { grid: number[]; rack: number[] }> = {};
  rows.forEach((r) => {
    const h = hourOf(r.timestamp);
    byHour[h] ??= { grid: [], rack: [] };
    byHour[h].grid.push(r.grid_kw);
    byHour[h].rack.push(r.rack_kw);
  });
  const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const last = rows[rows.length - 1];
  const prev = rows[Math.max(0, rows.length - 4)];
  const driftG = (last.grid_kw - prev.grid_kw) / 4;
  const driftR = (last.rack_kw - prev.rack_kw) / 4;
  const grids = rows.map((r) => r.grid_kw).sort((a, b) => a - b);
  const p90 = grids[Math.floor(grids.length * 0.9)] || last.grid_kw;

  const start = new Date(last.timestamp || Date.now()).getTime();
  const forecast: ForecastPoint[] = [];
  for (let i = 1; i <= horizon; i++) {
    const t = new Date(start + i * 3600000);
    const h = t.getHours();
    const seasonalG = mean(byHour[h]?.grid || [last.grid_kw]);
    const seasonalR = mean(byHour[h]?.rack || [last.rack_kw]);
    const grid = Math.max(0, seasonalG + driftG * 0.25);
    const rack = Math.max(1, seasonalR + driftR * 0.25);
    const pue = grid / rack;
    forecast.push({
      at: t.toISOString(),
      hour: h,
      grid_kw: +grid.toFixed(1),
      rack_kw: +rack.toFixed(1),
      pue: +pue.toFixed(3),
      peak: pue > 1.4 || grid > p90
    });
  }

  const actions: ControlAction[] = [];
  const firstPeak = forecast.find((f) => f.peak);
  if (firstPeak) {
    const pre = new Date(new Date(firstPeak.at).getTime() - 3600000).toISOString();
    actions.push({
      id: 'precool',
      when: pre,
      action: 'Pré-refroidir 1 h avant le pic (consigne −1 °C puis retour).',
      why: `Pic prévu ${new Date(firstPeak.at).getHours()} h · PUE ${firstPeak.pue}`
    });
    actions.push({
      id: 'shift-it',
      when: firstPeak.at,
      action: 'Décaler jobs GPU / batch hors de cette heure.',
      why: `${firstPeak.grid_kw} kW réseau prévus`
    });
  }
  const nightPeak = forecast.find((f) => f.peak && (f.hour >= 22 || f.hour < 6));
  if (nightPeak) {
    actions.push({
      id: 'crah-night',
      when: nightPeak.at,
      action: 'Éteindre un CRAH redondant si ΔT racks reste dans ASHRAE A1.',
      why: 'Pic de nuit : le froid ne suit pas la baisse IT.'
    });
  }
  if (!actions.length) {
    actions.push({
      id: 'hold',
      when: forecast[0]?.at || new Date().toISOString(),
      action: 'Aucune action : pas de pic PUE / puissance sur 12 h.',
      why: 'Modèle saisonnier + dérive courte.'
    });
  }
  return { forecast, actions, model: 'saisonnier (heure J-1) + dérive 4 points' };
}
