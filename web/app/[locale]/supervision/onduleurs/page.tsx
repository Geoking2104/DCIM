import Header from '@/components/Header';
import Providers from '@/components/Providers';
import MetricsLinks from '@/components/metrics/MetricsLinks';
import PowerShieldConsole from '@/components/powershield/PowerShieldConsole';

export const dynamic = 'force-dynamic';

export default async function OnduleursPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <Providers>
      <Header />
      <main className="bg-[#030712] text-slate-100">
        <section className="mx-auto max-w-[1440px] px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">
            Supervision · Onduleurs & batteries
          </p>
          <h1 className="mt-1 text-[28px] font-extrabold md:text-[34px]">
            PowerShield — chaîne onduleurs & cellules
          </h1>
          <p className="mt-2 max-w-[88ch] text-[14px] text-slate-400">
            Console de supervision des chaînes UPS : modules de batteries cliquables, détection locale des dérives
            (ΔV, température, SoC), inspection cellule par cellule et préparation des ordres d’isolation. Données
            ClickHouse en live ou démo explicite ; sans source, l’état « indisponible » est affiché — aucun repli
            silencieux.
          </p>
          <div className="mt-6">
            <PowerShieldConsole />
          </div>
        </section>

        <div className="border-t border-slate-800 bg-[#FAFAF9] text-slate-800">
          <section className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
            <MetricsLinks locale={locale} current="/supervision/onduleurs" />
            <div className="grid gap-6 text-[13px] md:grid-cols-3">
              <div className="rounded-xl border bg-white p-4">
                <h2 className="font-bold">Sources de données</h2>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
                  <li>
                    Cellules : <code className="font-mono text-[11px]">/api/clickhouse/battery?rack=UPS-A1|UPS-A2</code>{' '}
                    (table <code className="font-mono text-[11px]">battery_cells</code>).
                  </li>
                  <li>
                    Chaîne : <code className="font-mono text-[11px]">power_metrics</code> via{' '}
                    <code className="font-mono text-[11px]">/api/clickhouse/power</code>.
                  </li>
                  <li>Badges LIVE / DÉMO / INDISPONIBLE sur chaque panneau — pas de repli silencieux.</li>
                </ul>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <h2 className="font-bold">Sécurité & garde-fous</h2>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
                  <li>Ordres d’isolation bloqués tant que BMS_URL + BMS_WRITE=1 ne sont pas configurés — aucune trame émise.</li>
                  <li>Chaque action est journalisée dans le panneau d’escalade.</li>
                  <li>Export cellule = préparation de revue humaine (pas un label officiel).</li>
                </ul>
              </div>
              <div className="rounded-xl border bg-white p-4">
                <h2 className="font-bold">Suite</h2>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-slate-600">
                  <li>Brancher les chaînes réelles (Redfish/SNMP → spool → ClickHouse).</li>
                  <li>Impédance & SoH réels côté BMS (aujourd’hui : dérives ΔV / T / SoC).</li>
                  <li>Escalade sortante SMS/e-mail via la boîte Grafana (/api/alerts).</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>
    </Providers>
  );
}
