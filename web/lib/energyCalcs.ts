export function pue(totalKwh: number, itKwh: number) {
  if (!itKwh || itKwh <= 0) return null;
  if (totalKwh < itKwh) return { error: 'L’électricité des machines ne peut pas dépasser celle de toute la salle.' };
  return { value: totalKwh / itKwh };
}

export function wue(waterL: number, itKwh: number) {
  if (!itKwh || itKwh <= 0) return null;
  return { value: waterL / itKwh };
}

export function pueBand(v: number) {
  if (v < 1.2) return { label: 'Très efficace', hint: 'Peu de pertes hors machines. À tenir dans le temps, pas un mois isolé.', tone: 'good' };
  if (v < 1.4) return { label: 'Bon', hint: 'Dans la fourchette des salles bien tenues. Le dossier européen aimera la série, pas le chiffre seul.', tone: 'good' };
  if (v < 1.7) return { label: 'Moyen', hint: 'Beaucoup de salles françaises sont là. Le froid et les pertes de transformation pèsent souvent.', tone: 'mid' };
  return { label: 'À travailler', hint: 'Trop d’électricité part ailleurs que dans les machines. Mesurez d’abord les prises, puis le froid.', tone: 'bad' };
}

export function wueBand(v: number) {
  if (v < 0.2) return { label: 'Très sobre en eau', hint: 'Air ou boucle fermée, peu d’appoint. Vérifiez que les litres sont bien ceux de la salle.', tone: 'good' };
  if (v < 1) return { label: 'Raisonnable', hint: 'Appoint et humidification visibles. Suivez l’été à part.', tone: 'mid' };
  return { label: 'Gourmand en eau', hint: 'Tours ou adiabatique lourds. Le dossier eau européen demandera la même période que l’électricité.', tone: 'bad' };
}
