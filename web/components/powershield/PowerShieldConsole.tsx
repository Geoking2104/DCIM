'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  CheckCircle,
  CursorClick,
  Fire,
  Gauge,
  Lightning,
  Pulse,
  Stack,
  Thermometer,
  Warning,
  WarningOctagon
} from '@phosphor-icons/react';
import {
  Bar,
  BarChart,
  Cell as BarCell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import PowerShieldScene, { type SceneBlock, type SceneViewCommand } from './PowerShieldScene';
import CellDetailModal from './CellDetailModal';
import {
  cellSeverity,
  detectCellAnomalies,
  NOMINAL_VOLTAGE,
  worstAnomaly,
  type BatteryCell,
  type CellAnomaly,
  type StringKind
} from '@/lib/powerShield';

type Source = 'live' | 'demo' | 'unavailable';
type JournalEntry = { at: string; level: 'info' | 'warning' | 'critical'; text: string };

const STRINGS: Array<{ id: string; kind: StringKind; technology: string; detail: string }> = [
  { id: 'UPS-A1', kind: 'li-ion', technology: 'Li-ion', detail: 'Chaîne 480 V DC' },
  { id: 'UPS-A2', kind: 'vrla', technology: 'VRLA', detail: 'Chaîne 480 V DC' }
];

const BLOCK_LAYOUT = (() => {
  const out: Array<{ id: string; stringIndex: number; rackIndex: number; level: number }> = [];
  STRINGS.forEach((string, stringIndex) => {
    for (let rackIndex = 0; rackIndex < 2; rackIndex += 1) {
      for (let level = 0; level < 8; level += 1) {
        out.push({
          id: `${string.id}-R${rackIndex + 1}-B${level + 1}`,
          stringIndex,
          rackIndex,
          level
        });
      }
    }
  });
  return out;
})();

const THRESHOLD_ROWS = [
  { label: 'Détection ΔV cellule', value: 'alerte ≥ 0,25 V · critique ≥ 0,40 V' },
  { label: 'Température', value: 'attention ≥ 37 °C · critique ≥ 40 °C' },
  { label: 'SoC bas', value: '< 20 %' },
  { label: 'Ordres d’isolation', value: 'gated — BMS_URL + BMS_WRITE=1' },
  { label: 'Rafraîchissement', value: 'cellules 15 s · chaîne 60 s' }
];

const SOURCE_LABEL: Record<Source, string> = {
  live: 'LIVE',
  demo: 'DÉMO',
  unavailable: 'INDISPONIBLE'
};

const TOOLTIP_STYLE = {
  background: '#0B1220',
  border: '1px solid #1e293b',
  borderRadius: 8,
  fontSize: 11,
  color: '#e2e8f0'
} as const;

function severityColor(severity: 'ok' | 'warning' | 'critical'): string {
  if (severity === 'critical') return '#ef4444';
  if (severity === 'warning') return '#f59e0b';
  return '#10b981';
}

export default function PowerShieldConsole() {
  const [cellsByString, setCellsByString] = useState<Record<string, BatteryCell[]>>({});
  const [sourcesByString, setSourcesByString] = useState<Record<string, Source>>({});
  const [errorsByString, setErrorsByString] = useState<Record<string, string>>({});
  const [powerSeries, setPowerSeries] = useState<Array<{ t: string; voltage: number }>>([]);
  const [powerSource, setPowerSource] = useState<Source>('unavailable');
  const [powerError, setPowerError] = useState('');
  const [selectedStringId, setSelectedStringId] = useState('UPS-A1');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [modalBlock, setModalBlock] = useState<SceneBlock | null>(null);
  const [thermalOverlay, setThermalOverlay] = useState(false);
  const [viewCommand, setViewCommand] = useState<SceneViewCommand>(null);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [lastRead, setLastRead] = useState('');
  const journalKeys = useRef(new Set<string>());

  const pushJournal = useCallback((level: JournalEntry['level'], text: string) => {
    setJournal((prev) => [{ at: new Date().toISOString(), level, text }, ...prev].slice(0, 30));
  }, []);

  const loadCells = useCallback(async (stringId: string) => {
    try {
      const res = await fetch(`/api/clickhouse/battery?rack=${encodeURIComponent(stringId)}`, { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      const source: Source = res.headers.get('x-dcim-data-source') === 'demo' ? 'demo' : 'live';
      setCellsByString((prev) => ({ ...prev, [stringId]: Array.isArray(json) ? (json as BatteryCell[]) : [] }));
      setSourcesByString((prev) => ({ ...prev, [stringId]: source }));
      setErrorsByString((prev) => ({ ...prev, [stringId]: '' }));
      setLastRead(format(new Date(), 'HH:mm:ss'));
    } catch (error) {
      setCellsByString((prev) => ({ ...prev, [stringId]: [] }));
      setSourcesByString((prev) => ({ ...prev, [stringId]: 'unavailable' }));
      setErrorsByString((prev) => ({
        ...prev,
        [stringId]: error instanceof Error ? error.message : 'source indisponible'
      }));
    }
  }, []);

  const loadPower = useCallback(async () => {
    try {
      const res = await fetch('/api/clickhouse/power?hours=1', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`);
      const series = (Array.isArray(json) ? json : []).map((point: { timestamp: string; voltage: number }) => ({
        t: point.timestamp,
        voltage: Number(point.voltage)
      }));
      setPowerSeries(series);
      setPowerSource(res.headers.get('x-dcim-data-source') === 'demo' ? 'demo' : 'live');
      setPowerError('');
    } catch (error) {
      setPowerSeries([]);
      setPowerSource('unavailable');
      setPowerError(error instanceof Error ? error.message : 'source indisponible');
    }
  }, []);

  useEffect(() => {
    STRINGS.forEach((string) => void loadCells(string.id));
    void loadPower();
    const cellsTimer = setInterval(() => STRINGS.forEach((string) => void loadCells(string.id)), 15000);
    const powerTimer = setInterval(() => void loadPower(), 60000);
    return () => {
      clearInterval(cellsTimer);
      clearInterval(powerTimer);
    };
  }, [loadCells, loadPower]);

  const anomaliesByString = useMemo(() => {
    const out: Record<string, CellAnomaly[]> = {};
    STRINGS.forEach((string) => {
      out[string.id] = detectCellAnomalies(cellsByString[string.id] ?? [], string.kind);
    });
    return out;
  }, [cellsByString]);

  const worstByString = useMemo(() => {
    const out: Record<string, CellAnomaly | null> = {};
    STRINGS.forEach((string) => {
      out[string.id] = worstAnomaly(anomaliesByString[string.id] ?? []);
    });
    return out;
  }, [anomaliesByString]);

  useEffect(() => {
    STRINGS.forEach((string) => {
      const source = sourcesByString[string.id];
      if (source) {
        const key = `src:${string.id}:${source}`;
        if (!journalKeys.current.has(key)) {
          journalKeys.current.add(key);
          pushJournal(
            source === 'unavailable' ? 'warning' : 'info',
            source === 'live'
              ? `${string.id} — source live (ClickHouse).`
              : source === 'demo'
                ? `${string.id} — démo explicite (double opt-in).`
                : `${string.id} — source indisponible : ${errorsByString[string.id] || 'non configurée'}.`
          );
        }
      }
      const worst = worstByString[string.id];
      if (worst) {
        const key = `anom:${string.id}:${worst.cellId}:${worst.severity}`;
        if (!journalKeys.current.has(key)) {
          journalKeys.current.add(key);
          pushJournal(
            worst.severity,
            `[DyAD ${worst.severity === 'critical' ? 'N2' : 'N1'}] ${string.id} · cellule ${worst.cellId} — ${worst.reason}.`
          );
        }
      }
    });
  }, [sourcesByString, errorsByString, worstByString, pushJournal]);

  const selectedString = STRINGS.find((s) => s.id === selectedStringId) ?? STRINGS[0];
  const selectedCells = useMemo(
    () => cellsByString[selectedString.id] ?? [],
    [cellsByString, selectedString.id]
  );
  const selectedAnomalies = useMemo(
    () => anomaliesByString[selectedString.id] ?? [],
    [anomaliesByString, selectedString.id]
  );
  const selectedSource: Source = sourcesByString[selectedString.id] ?? 'unavailable';
  const selectedError = errorsByString[selectedString.id] || '';
  const selectedWorst = worstByString[selectedString.id];

  const allAnomalies = STRINGS.flatMap((s) => anomaliesByString[s.id] ?? []);
  const criticalCount = allAnomalies.filter((a) => a.severity === 'critical').length;
  const warningCount = allAnomalies.filter((a) => a.severity === 'warning').length;
  const cellCount = STRINGS.reduce((sum, s) => sum + (cellsByString[s.id]?.length ?? 0), 0);
  const everythingUnavailable = STRINGS.every((s) => sourcesByString[s.id] === 'unavailable');

  const escalation = useMemo(() => {
    if (criticalCount > 0) {
      return {
        label: 'Escalade N2 active',
        tone: 'critical' as const,
        note: 'cellule critique détectée — revue immédiate requise'
      };
    }
    if (warningCount > 0) {
      return { label: 'Escalade N1', tone: 'warning' as const, note: 'dérive à surveiller au prochain cycle' };
    }
    if (everythingUnavailable) {
      return { label: 'Escalade inconnue', tone: 'neutral' as const, note: 'sources indisponibles — détection en pause' };
    }
    return { label: 'Veille', tone: 'ok' as const, note: 'aucune anomalie détectée' };
  }, [criticalCount, warningCount, everythingUnavailable]);

  const sceneBlocks: SceneBlock[] = useMemo(() => {
    return BLOCK_LAYOUT.map((layout) => {
      const string = STRINGS[layout.stringIndex];
      const cells = cellsByString[string.id] ?? [];
      const worst = worstByString[string.id];
      let severity: SceneBlock['severity'] = 'ok';
      let temp = cells.length > 0 ? Math.max(...cells.map((c) => Number(c.temp) || 0)) : 26;
      if (worst && cells.length > 0) {
        const index = cells.findIndex((c) => String(c.cell_id) === worst.cellId);
        const ownerRack = index >= 0 ? Math.floor(index / 8) % 2 : 0;
        const ownerLevel = index >= 0 ? index % 8 : 0;
        if (layout.rackIndex === ownerRack && layout.level === ownerLevel) {
          severity = worst.severity;
          temp = worst.temp || temp;
        }
      }
      return { ...layout, severity, temp };
    });
  }, [cellsByString, worstByString]);

  const voltageChart = useMemo(
    () =>
      powerSeries.map((point) => ({
        label: format(new Date(point.t), 'HH:mm'),
        voltage: Number(point.voltage.toFixed(1))
      })),
    [powerSeries]
  );

  const cellChart = useMemo(
    () =>
      selectedCells.map((cell) => ({
        name: String(cell.cell_id).replace(/^CELL-/, '#'),
        voltage: Number(cell.voltage),
        fill: severityColor(cellSeverity(String(cell.cell_id), selectedAnomalies))
      })),
    [selectedCells, selectedAnomalies]
  );

  const setView = (kind: 'front' | 'top') => {
    setViewCommand((prev) => ({ kind, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  const focusSelectedString = () => {
    const stringIndex = STRINGS.findIndex((s) => s.id === selectedString.id);
    setViewCommand((prev) => ({ kind: 'string', stringIndex, nonce: (prev?.nonce ?? 0) + 1 }));
  };

  const openBlock = (block: SceneBlock) => {
    setSelectedBlockId(block.id);
    setSelectedStringId(STRINGS[block.stringIndex].id);
    setModalBlock(block);
  };

  const openWorstCellBlock = () => {
    if (!selectedWorst) return;
    const index = selectedCells.findIndex((c) => String(c.cell_id) === selectedWorst.cellId);
    const rackIndex = index >= 0 ? Math.floor(index / 8) % 2 : 0;
    const level = index >= 0 ? index % 8 : 0;
    const block =
      sceneBlocks.find((b) => b.stringIndex === STRINGS.indexOf(selectedString) && b.rackIndex === rackIndex && b.level === level) ??
      sceneBlocks.find((b) => b.stringIndex === STRINGS.indexOf(selectedString)) ??
      null;
    if (block) openBlock(block);
  };

  const handleIsolate = async (anomaly: CellAnomaly): Promise<string> => {
    if (!modalBlock) return 'Aucun bloc sélectionné.';
    const string = STRINGS[modalBlock.stringIndex];
    const point = `ups.${string.id}.cell.${anomaly.cellId}.isolate`;
    let message: string;
    try {
      const res = await fetch('/api/bms/write', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ point, value: true })
      });
      const json = await res.json().catch(() => null);
      message = json?.written
        ? `Ordre d’isolation émis (${point}).`
        : `Ordre d’isolation « ${point} » préparé — NON envoyé (${json?.reason || `HTTP ${res.status}`}). Aucune trame émise.`;
    } catch (error) {
      message = `Ordre préparé localement — plateforme BMS injoignable (${error instanceof Error ? error.message : 'erreur'}). Aucune trame émise.`;
    }
    pushJournal('warning', message);
    return message;
  };

  const modalString = modalBlock ? STRINGS[modalBlock.stringIndex] : selectedString;
  const modalCells = cellsByString[modalString.id] ?? [];
  const modalAnomalies = anomaliesByString[modalString.id] ?? [];

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-700/70 bg-[#070d19]/90 shadow-2xl shadow-black/40 backdrop-blur-xl lg:h-[78vh] lg:min-h-[640px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-2.5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-[13px] font-black tracking-wider text-blue-400">
            <Lightning size={15} weight="fill" />
            QINODE <span className="font-light text-slate-400">| PowerShield BMS</span>
          </span>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            IEEE 1491 / 1188 — préparation revue
          </span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300">
            Isolation optique — ordres gated
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
          <span>
            Cellules : <b className="font-mono text-slate-100">{cellCount}</b>
          </span>
          <span>
            Anomalies :{' '}
            <b className={`font-mono ${criticalCount > 0 ? 'text-red-400' : warningCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {criticalCount + warningCount}
            </b>
          </span>
          <span className="font-mono">{lastRead ? `lecture ${lastRead}` : 'lecture…'}</span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
              escalation.tone === 'critical'
                ? 'border-red-500/50 bg-red-600/20 text-red-300'
                : escalation.tone === 'warning'
                  ? 'border-amber-500/50 bg-amber-600/20 text-amber-300'
                  : escalation.tone === 'ok'
                    ? 'border-emerald-500/40 bg-emerald-600/15 text-emerald-300'
                    : 'border-slate-600 bg-slate-800 text-slate-300'
            }`}
            title={escalation.note}
          >
            {escalation.tone === 'critical' ? <WarningOctagon size={12} /> : escalation.tone === 'ok' ? <CheckCircle size={12} /> : <Warning size={12} />}
            {escalation.label}
          </span>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)_360px]">
        <aside className="space-y-4 overflow-y-auto border-b border-slate-800 p-4 lg:border-b-0 lg:border-r">
          <div>
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Topologie & chaînes UPS</h2>
            <div className="space-y-2">
              {STRINGS.map((string) => {
                const worst = worstByString[string.id];
                const source = sourcesByString[string.id];
                const active = string.id === selectedString.id;
                const critical = worst?.severity === 'critical';
                return (
                  <button
                    key={string.id}
                    onClick={() => setSelectedStringId(string.id)}
                    className={`w-full rounded-lg border p-2.5 text-left transition ${
                      critical
                        ? 'border-red-500/50 bg-red-950/40 hover:bg-red-900/40'
                        : active
                          ? 'border-cyan-500/60 bg-cyan-950/30 hover:bg-cyan-900/30'
                          : 'border-slate-700 bg-slate-800/70 hover:bg-slate-700/70'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className={`text-[13px] font-semibold ${critical ? 'text-red-300' : 'text-slate-200'}`}>
                        {string.id} · {string.technology}
                      </span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          critical ? 'animate-pulse bg-red-500' : worst ? 'bg-amber-500' : source === 'unavailable' ? 'bg-slate-600' : 'bg-emerald-500'
                        }`}
                      />
                    </span>
                    <span className={`mt-0.5 block text-[11px] ${critical ? 'text-red-400' : 'text-slate-400'}`}>
                      {string.detail}
                      {worst
                        ? ` · anomalie ${worst.severity === 'critical' ? 'critique' : 'à surveiller'}`
                        : source === 'unavailable'
                          ? ' · source indisponible'
                          : ' · nominal'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-3">
            <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Seuils & garde-fous</h2>
            <div className="space-y-2 text-[11px]">
              {THRESHOLD_ROWS.map((row) => (
                <div key={row.label} className="flex justify-between gap-3 rounded border border-slate-800 bg-slate-900/60 p-2">
                  <span className="text-slate-300">{row.label}</span>
                  <span className="text-right font-mono text-cyan-300">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1 flex-col border-t border-slate-800 pt-3">
            <h2 className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Pulse size={13} /> Détection locale DyAD
              </span>
              <span className="rounded border border-cyan-800 bg-cyan-950 px-1.5 py-0.5 text-[10px] font-normal text-cyan-300">
                seuils locaux
              </span>
            </h2>
            {selectedSource === 'unavailable' ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-3 text-[11px] text-amber-200">
                Source indisponible — détection en pause.
                {selectedError && <span className="mt-1 block text-amber-300/80">{selectedError}</span>}
              </div>
            ) : selectedWorst ? (
              <div
                className={`space-y-2 rounded-lg border p-3 text-[11px] ${
                  selectedWorst.severity === 'critical'
                    ? 'border-red-500/50 bg-red-950/50'
                    : 'border-amber-500/50 bg-amber-950/40'
                }`}
              >
                <div className={`flex justify-between font-bold ${selectedWorst.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                  <span>{selectedWorst.severity === 'critical' ? 'Cellule en défaut' : 'Dérive surveillée'}</span>
                  <span className="font-mono">{selectedWorst.cellId}</span>
                </div>
                <p className={selectedWorst.severity === 'critical' ? 'text-red-200' : 'text-amber-200'}>
                  {selectedWorst.reason} — seuils : ΔV ≥ 0,25 V · T ≥ 37 °C · SoC &lt; 20 %.
                </p>
                <button
                  onClick={openWorstCellBlock}
                  className={`flex w-full items-center justify-center gap-1.5 rounded py-1.5 text-[11px] font-bold transition ${
                    selectedWorst.severity === 'critical'
                      ? 'bg-red-600 text-white hover:bg-red-500'
                      : 'bg-amber-600 text-white hover:bg-amber-500'
                  }`}
                >
                  <CursorClick size={13} />
                  Inspecter la cellule {selectedWorst.cellId}
                </button>
              </div>
            ) : selectedCells.length === 0 ? (
              <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-[11px] text-slate-400">
                Aucune cellule remontée pour cette chaîne — vérifier l’ingestion ClickHouse
                (<code className="font-mono">battery_cells</code>).
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-3 text-[11px] text-emerald-200">
                <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle size={13} /> Aucune anomalie sur {selectedCells.length} cellules
                </span>
                <span className="mt-1 block text-emerald-200/80">
                  Surveillance {selectedSource === 'demo' ? 'démo' : 'live'} — comparaison au nominal {NOMINAL_VOLTAGE[selectedString.kind].toFixed(2)} V.
                </span>
              </div>
            )}
          </div>
        </aside>

        <div className="relative flex min-h-[420px] flex-1 flex-col bg-[#030712]">
          <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
            <button onClick={() => setView('front')} className="rounded border border-slate-700 bg-slate-800/85 px-2.5 py-1.5 text-[11px] text-slate-200 transition hover:bg-slate-700">
              Vue face
            </button>
            <button onClick={() => setView('top')} className="rounded border border-slate-700 bg-slate-800/85 px-2.5 py-1.5 text-[11px] text-slate-200 transition hover:bg-slate-700">
              Vue dessus
            </button>
            <button onClick={focusSelectedString} className="rounded border border-slate-700 bg-slate-800/85 px-2.5 py-1.5 text-[11px] text-slate-200 transition hover:bg-slate-700">
              Focus {selectedString.id}
            </button>
            <button
              onClick={() => setThermalOverlay((value) => !value)}
              aria-pressed={thermalOverlay}
              className={`flex items-center gap-1 rounded border px-2.5 py-1.5 text-[11px] font-bold transition ${
                thermalOverlay
                  ? 'border-cyan-400 bg-cyan-600 text-white'
                  : 'border-blue-500/60 bg-blue-600/70 text-white hover:bg-blue-500'
              }`}
            >
              <Thermometer size={13} />
              Calque thermique
            </button>
          </div>

          <div className="h-[420px] w-full lg:h-auto lg:flex-1">
            <PowerShieldScene
              blocks={sceneBlocks}
              selectedBlockId={selectedBlockId}
              thermalOverlay={thermalOverlay}
              viewCommand={viewCommand}
              onSelectBlock={openBlock}
            />
          </div>

          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-10 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-700/60 bg-[#0B1220]/85 px-3 py-2 text-[10px] text-slate-300 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-emerald-500" /> Normal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-amber-500" /> Alerte (dérive ΔV / T)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 animate-pulse rounded bg-red-500" /> Critique (défaut cellule)
              </span>
            </div>
            <span className="text-slate-400">Cliquez un module pour inspecter les cellules · glisser pour pivoter</span>
          </div>
        </div>

        <aside className="flex flex-col gap-4 overflow-y-auto border-t border-slate-800 p-4 lg:border-l lg:border-t-0">
          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Gauge size={13} className="text-cyan-400" /> Tension chaîne (V DC) · 1 h
              </span>
              <span className="font-mono text-[10px] text-slate-400">{SOURCE_LABEL[powerSource]}</span>
            </div>
            {powerError ? (
              <p className="text-[11px] text-red-300">Indisponible : {powerError}</p>
            ) : voltageChart.length === 0 ? (
              <p className="text-[11px] text-slate-500">Lecture de la série puissance…</p>
            ) : (
              <div className="h-[110px]">
                <ResponsiveContainer>
                  <LineChart data={voltageChart}>
                    <XAxis dataKey="label" hide />
                    <YAxis width={34} domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="voltage" stroke="#38bdf8" dot={false} strokeWidth={1.6} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Stack size={13} className="text-emerald-400" /> Tension par cellule · nominal{' '}
                {NOMINAL_VOLTAGE[selectedString.kind].toFixed(2)} V
              </span>
              <span className="font-mono text-[10px] text-slate-400">{SOURCE_LABEL[selectedSource]}</span>
            </div>
            {cellChart.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                {selectedSource === 'unavailable' ? 'Source indisponible.' : 'Aucune cellule remontée.'}
              </p>
            ) : (
              <div className="h-[120px]">
                <ResponsiveContainer>
                  <BarChart data={cellChart}>
                    <XAxis dataKey="name" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
                    <YAxis width={30} domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#94a3b8' }} cursor={{ fill: 'rgba(56,189,248,0.08)' }} />
                    <ReferenceLine y={NOMINAL_VOLTAGE[selectedString.kind]} stroke="#64748b" strokeDasharray="3 3" />
                    <Bar dataKey="voltage" radius={[3, 3, 0, 0]}>
                      {cellChart.map((entry) => (
                        <BarCell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col border-t border-slate-800 pt-3">
            <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <Fire size={13} className="text-amber-400" /> Journal d’escalade & actions
            </h2>
            {journal.length === 0 ? (
              <p className="text-[11px] text-slate-500">En attente d’événements…</p>
            ) : (
              <ul className="max-h-[220px] space-y-1.5 overflow-y-auto pr-1 text-[10px]">
                {journal.map((entry, index) => (
                  <li
                    key={`${entry.at}-${index}`}
                    className={`rounded border-l-2 p-1.5 ${
                      entry.level === 'critical'
                        ? 'border-red-500 bg-red-950/40 text-red-200'
                        : entry.level === 'warning'
                          ? 'border-amber-500 bg-amber-950/30 text-amber-200'
                          : 'border-cyan-500 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    <span className="font-mono text-slate-400">{format(new Date(entry.at), 'HH:mm:ss')}</span> {entry.text}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-[10px] leading-snug text-slate-500">
              Les actions d’isolation sont préparées localement puis bloquées tant que le connecteur optique n’est pas
              configuré (BMS_URL + BMS_WRITE=1). Aucune trame ne quitte le SI sans explicite.
            </p>
          </div>
        </aside>
      </div>

      <CellDetailModal
        open={Boolean(modalBlock)}
        title={modalBlock ? `Bloc ${modalBlock.id.replace(`${modalString.id}-`, '')} · chaîne ${modalString.id}` : ''}
        subtitle={`${modalString.technology} · ${modalCells.length} cellules supervisées · détection locale DyAD`}
        kind={modalString.kind}
        cells={modalCells}
        anomalies={modalAnomalies}
        source={sourcesByString[modalString.id] ?? 'unavailable'}
        error={errorsByString[modalString.id]}
        onClose={() => setModalBlock(null)}
        onIsolate={handleIsolate}
        onExported={(count) =>
          pushJournal('info', `Export préparation revue IEEE 1188 — ${modalString.id} · ${count} cellules.`)
        }
      />
    </div>
  );
}
