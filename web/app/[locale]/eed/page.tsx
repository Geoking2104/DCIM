import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import EedComplianceContainer from '@/components/eed/EedComplianceContainer';

export const dynamic = 'force-dynamic';

const LINKS = [
  { href: 'https://www.ca-eed.eu/energy-efficiency-directive/', label: 'CA EED — documentation officielle' },
  { href: 'https://energy.ec.europa.eu/topics/energy-efficiency/energy-efficiency-targets-directive-and-rules/energy-efficiency-directive/energy-performance-data-centres_en', label: 'Commission — performance des datacenters' },
  { href: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023L1791', label: 'Directive (UE) 2023/1791' },
  { href: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32024R1364', label: 'Règlement délégué (UE) 2024/1364' }
];

export default async function EedPage({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale = 'fr' } = await params;
  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <MetricsLinks locale={locale} current="/eed" />
          <div className="bg-[#C8FF2E] text-black p-4 font-mono text-[12px] space-y-2">
            <div className="font-bold">Reporting officiel — le dépôt se fait sur les portails UE / nationaux, pas ici.</div>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 underline">
              {LINKS.map((l) => (
                <li key={l.href}><a href={l.href} target="_blank" rel="noopener">{l.label}</a></li>
              ))}
            </ul>
          </div>
          <h1 className="text-3xl font-black">Dossier EED Qinode</h1>
          <p className="text-slate-400 max-w-3xl text-sm">
            Calculs PUE / WUE / CUE / ERF alignés sur l’annexe III du règlement 2024/1364.
            Premier reporting européen : 15 septembre 2024, puis cycle annuel (souvent 15 mai selon transposition).
            Le label A–G affiché ici est une échelle interne.
          </p>
          <EedComplianceContainer siteId="site-paris-01" siteName="Paris East High-Density Data Center" />
        </div>
      </main>
    </Providers>
  );
}
