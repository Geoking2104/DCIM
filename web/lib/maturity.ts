export type AxisId =
  | 'materiel'
  | 'place'
  | 'deplacements'
  | 'courant'
  | 'climat'
  | 'salle3d'
  | 'acces'
  | 'reglementaire';

export type Choice = { label: string; score: 0 | 1 | 2 | 3 };

export type Question = {
  id: string;
  axis: AxisId;
  title: string;
  help?: string;
  choices: Choice[];
};

export const AXES: { id: AxisId; title: string; module: string; path: string }[] = [
  { id: 'materiel', title: 'Le matériel', module: 'Matériel', path: '/modules/actifs' },
  { id: 'place', title: 'La place', module: 'Place disponible', path: '/modules/capacite' },
  { id: 'deplacements', title: 'Les déplacements', module: 'Déplacements', path: '/modules/changement' },
  { id: 'courant', title: 'Le courant', module: 'Électricité / prises', path: '/power' },
  { id: 'climat', title: 'Le climat', module: 'Climat', path: '/modules/environnement' },
  { id: 'salle3d', title: 'La salle en volume', module: 'Salle en 3D', path: '/modules/visualisation-3d' },
  { id: 'acces', title: 'Les accès', module: 'Accès', path: '/modules/securite' },
  { id: 'reglementaire', title: 'Le dossier européen', module: 'Dossier énergie', path: '/eed' }
];

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    axis: 'materiel',
    title: 'Comment savez-vous ce qui est dans chaque armoire ?',
    choices: [
      { label: 'Un tableur, souvent en retard', score: 0 },
      { label: 'Un inventaire, mis à jour de temps en temps', score: 1 },
      { label: 'Un outil, mais déconnecté des câbles et du courant', score: 2 },
      { label: 'Chaque machine a une fiche vivante (place, câbles, responsable)', score: 3 }
    ]
  },
  {
    id: 'q2',
    axis: 'place',
    title: 'Avant de poser un serveur, savez-vous s’il rentre ?',
    choices: [
      { label: 'On ouvre la porte et on voit', score: 0 },
      { label: 'On a une idée de la hauteur libre', score: 1 },
      { label: 'On vérifie hauteur et courant, à part', score: 2 },
      { label: 'On teste à l’écran hauteur, poids, courant et prises', score: 3 }
    ]
  },
  {
    id: 'q3',
    axis: 'deplacements',
    title: 'Quand une machine change d’armoire, que reste-t-il ?',
    choices: [
      { label: 'Un message, parfois rien', score: 0 },
      { label: 'Un ticket, sans essai avant le jour J', score: 1 },
      { label: 'Un ticket + un plan, le journal est incomplet', score: 2 },
      { label: 'Demande, essai à l’écran, accord, journal écrit', score: 3 }
    ]
  },
  {
    id: 'q4',
    axis: 'courant',
    title: 'Jusqu’où mesurez-vous l’électricité ?',
    choices: [
      { label: 'La facture du bâtiment, une fois par mois', score: 0 },
      { label: 'Les gros compteurs, pas les prises', score: 1 },
      { label: 'Les armoires, sans l’historique par prise', score: 2 },
      { label: 'Du compteur du bâtiment jusqu’à la prise, en continu', score: 3 }
    ]
  },
  {
    id: 'q5',
    axis: 'climat',
    title: 'Comment voyez-vous un point chaud ?',
    choices: [
      { label: 'Quand une machine coupe', score: 0 },
      { label: 'Un capteur au fond de la salle', score: 1 },
      { label: 'Quelques sondes, pas de carte par allée', score: 2 },
      { label: 'Carte de chaleur par allée, y compris l’eau froide', score: 3 }
    ]
  },
  {
    id: 'q6',
    axis: 'salle3d',
    title: 'Pouvez-vous montrer la salle à quelqu’un qui n’y est pas ?',
    choices: [
      { label: 'Un plan papier ou un PDF', score: 0 },
      { label: 'Des photos, pas à jour', score: 1 },
      { label: 'Une maquette, déconnectée du réel', score: 2 },
      { label: 'La salle dans le navigateur, avec courant et chaleur', score: 3 }
    ]
  },
  {
    id: 'q7',
    axis: 'acces',
    title: 'Un locataire voit-il seulement son périmètre ?',
    choices: [
      { label: 'Tout le monde voit tout, ou presque', score: 0 },
      { label: 'On filtre à la main dans les exports', score: 1 },
      { label: 'Des comptes, mais pas par zone ni par armoire', score: 2 },
      { label: 'Droits par personne, par locataire, journal des visites', score: 3 }
    ]
  },
  {
    id: 'q8',
    axis: 'reglementaire',
    title: 'Le dossier énergie européen (rapport, étiquette, chaleur réutilisée) est-il prêt ?',
    help: 'Règles déjà là et à venir : rapport énergie des salles, étiquette A à G, part de chaleur renvoyée (objectifs 2026 / 2027 / 2028), reporting extra-financier.',
    choices: [
      { label: 'On n’a pas commencé', score: 0 },
      { label: 'Un tableur une fois par an, incomplet', score: 1 },
      { label: 'Des chiffres, sans le même périmètre ni la chaleur réutilisée', score: 2 },
      { label: 'Chiffres alignés sur les compteurs, prêts à relire — le tampon reste humain', score: 3 }
    ]
  }
];

export type Answers = Record<string, 0 | 1 | 2 | 3>;

export function scoreAxes(answers: Answers) {
  return AXES.map((axis) => {
    const qs = QUESTIONS.filter((q) => q.axis === axis.id);
    const vals = qs.map((q) => answers[q.id]).filter((v) => v !== undefined) as number[];
    const raw = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    return { ...axis, raw, pct: Math.round((raw / 3) * 100) };
  });
}

export function globalScore(axes: { pct: number }[]) {
  if (!axes.length) return 0;
  return Math.round(axes.reduce((a, b) => a + b.pct, 0) / axes.length);
}

export function levelLabel(pct: number) {
  if (pct < 35) return 'Amorçage';
  if (pct < 60) return 'En cours';
  if (pct < 80) return 'Opérationnel';
  return 'Piloté';
}

export function formatContactBody(opts: {
  name: string;
  email: string;
  company: string;
  site: string;
  message: string;
  global: number;
  axes: { title: string; pct: number; module: string }[];
}) {
  const lines = [
    `Diagnostic Qinode — score global ${opts.global}/100 (${levelLabel(opts.global)})`,
    '',
    ...opts.axes.map((a) => `- ${a.title} : ${a.pct}/100 → ${a.module}`),
    '',
    `Nom : ${opts.name}`,
    `E-mail : ${opts.email}`,
    `Organisation : ${opts.company}`,
    `Site : ${opts.site}`,
    '',
    opts.message || '(pas de message)'
  ];
  return lines.join('\n');
}
