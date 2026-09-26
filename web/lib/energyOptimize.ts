export type Hint = { id: string; title: string; detail: string; savingKw: number; severity: 'ok' | 'warn' | 'high' };

export function optimizeFromSeries(rows: { grid_kw: number; rack_kw: number; pdu_kw?: number; timestamp: string }[]): {
  pueAvg: number;
  overheadKw: number;
  hints: Hint[];
} {
  if (!rows.length) return { pueAvg: 0, overheadKw: 0, hints: [] };
  const pues = rows.map((r) => {
    const it = r.rack_kw || r.pdu_kw || 0;
    return it > 0 ? r.grid_kw / it : 0;
  }).filter((v) => v > 0);
  const pueAvg = pues.reduce((a, b) => a + b, 0) / pues.length;
  const overheadKw = rows.reduce((a, r) => a + Math.max(0, r.grid_kw - (r.rack_kw || 0)), 0) / rows.length;
  const highShare = pues.filter((v) => v > 1.4).length / pues.length;
  const night = rows.filter((r) => {
    const h = new Date(r.timestamp).getHours();
    return h >= 22 || h < 6;
  });
  const nightPue = night.length
    ? night.reduce((a, r) => a + (r.rack_kw ? r.grid_kw / r.rack_kw : 0), 0) / night.length
    : pueAvg;

  const hints: Hint[] = [];
  if (pueAvg > 1.4) {
    hints.push({
      id: 'pue-high',
      title: 'PUE moyen au-dessus de 1,4',
      detail: 'Vérifier free cooling, consignes CRAH et étanchéité des allées. Cible interne : < 1,3.',
      savingKw: +(overheadKw * 0.15).toFixed(1),
      severity: 'high'
    });
  } else if (pueAvg > 1.2) {
    hints.push({
      id: 'pue-mid',
      title: 'Marge encore disponible',
      detail: 'Relever la consigne froid de 1 °C si les sondes rack restent dans ASHRAE A1.',
      savingKw: +(overheadKw * 0.06).toFixed(1),
      severity: 'warn'
    });
  } else {
    hints.push({
      id: 'pue-ok',
      title: 'Salle déjà sobre',
      detail: 'Garder le suivi 24 h. Le gain viendra surtout du remplissage racks et de la chaleur réutilisée.',
      savingKw: 0,
      severity: 'ok'
    });
  }
  if (highShare > 0.2) {
    hints.push({
      id: 'peaks',
      title: `${Math.round(highShare * 100)} % du temps en pic PUE`,
      detail: 'Croiser avec les démarrages groupes froids. Étaler les batchs GPU hors de ces fenêtres.',
      savingKw: +(overheadKw * highShare * 0.1).toFixed(1),
      severity: 'warn'
    });
  }
  if (nightPue > pueAvg * 1.08) {
    hints.push({
      id: 'night',
      title: 'Nuit plus gourmande que le jour',
      detail: 'IT baisse, le froid reste à pleine puissance. Réduire le nombre de CRAH la nuit.',
      savingKw: +(overheadKw * 0.08).toFixed(1),
      severity: 'warn'
    });
  }
  hints.push({
    id: 'heat',
    title: 'Chaleur fatale',
    detail: 'Si ERF < 10 % en 2026, étudier un échangeur vers le réseau de chaleur — le module ERF estime le gisement.',
    savingKw: 0,
    severity: 'ok'
  });
  return { pueAvg, overheadKw, hints };
}
