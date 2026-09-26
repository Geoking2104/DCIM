export const METRIC_LINKS = (locale: string) => [
  { href: `/${locale}/metriques`, label: 'Vue d’ensemble', path: '/metriques' },
  { href: `/${locale}/metriques/tendances`, label: 'Tendances', path: '/metriques/tendances' },
  { href: `/${locale}/metriques/optimiser`, label: 'Optimiser', path: '/metriques/optimiser' },
  { href: `/${locale}/metriques/predictif`, label: 'Prédictif', path: '/metriques/predictif' },
  { href: `/${locale}/supervision/bms`, label: 'BMS', path: '/supervision/bms' },
  { href: `/${locale}/outils/pue`, label: 'PUE', path: '/outils/pue' },
  { href: `/${locale}/power`, label: 'Puissance live', path: '/power' },
  { href: `/${locale}/eed`, label: 'Dossier EED', path: '/eed' },
  { href: `/${locale}/supervision`, label: 'Supervision', path: '/supervision' }
];

export default function MetricsLinks({ locale, current }: { locale: string; current?: string }) {
  return (
    <nav className="flex flex-wrap gap-2 text-[12px]" aria-label="Liens métriques">
      {METRIC_LINKS(locale).map((l) => (
        <a
          key={l.path}
          href={l.href}
          className={`px-3 py-1.5 rounded border ${current === l.path ? 'bg-[#032D60] text-white border-[#032D60]' : 'bg-white hover:border-[#0176D3]'}`}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}
