export function calcPue(totalKwh: number, itKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!itKwh || itKwh <= 0) return { ok: false, error: 'Indiquez l electricite des machines.' };
  if (totalKwh < itKwh) return { ok: false, error: 'Les machines ne peuvent pas consommer plus que la salle.' };
  return { ok: true, value: totalKwh / itKwh };
}

export function calcWue(waterL: number, itKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!itKwh || itKwh <= 0) return { ok: false, error: 'Indiquez l electricite des machines.' };
  return { ok: true, value: waterL / itKwh };
}
