export function calcPue(totalKwh: number, itKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!itKwh || itKwh <= 0) return { ok: false, error: 'Indiquez l electricite des machines.' };
  if (totalKwh < itKwh) return { ok: false, error: 'Les machines ne peuvent pas consommer plus que la salle.' };
  return { ok: true, value: totalKwh / itKwh };
}

export function calcWue(waterL: number, itKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!itKwh || itKwh <= 0) return { ok: false, error: 'Indiquez l electricite des machines.' };
  return { ok: true, value: waterL / itKwh };
}

export function calcCue(co2Kg: number, itKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!itKwh || itKwh <= 0) return { ok: false, error: 'Indiquez l electricite des machines.' };
  return { ok: true, value: co2Kg / itKwh };
}

export function calcErf(reusedKwh: number, facilityKwh: number): { ok: false; error: string } | { ok: true; value: number } {
  if (!facilityKwh || facilityKwh <= 0) return { ok: false, error: 'Indiquez l electricite de la salle.' };
  if (reusedKwh < 0) return { ok: false, error: 'La chaleur reutilisee ne peut pas etre negative.' };
  return { ok: true, value: reusedKwh / facilityKwh };
}
