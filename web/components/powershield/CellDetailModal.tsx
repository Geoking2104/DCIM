'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { DownloadSimple, ShieldCheck, Warning, WarningOctagon, X } from '@phosphor-icons/react';
import {
  buildIeeeCsv,
  cellSeverity,
  NOMINAL_VOLTAGE,
  worstAnomaly,
  type BatteryCell,
  type CellAnomaly,
  type StringKind
} from '@/lib/powerShield';

type CellDetailModalProps = {
  open: boolean;
  title: string;
  subtitle: string;
  kind: StringKind;
  cells: BatteryCell[];
  anomalies: CellAnomaly[];
  source: 'live' | 'demo' | 'unavailable';
  error?: string;
  onClose: () => void;
  onIsolate: (anomaly: CellAnomaly) => Promise<string>;
  onExported?: (cellCount: number) => void;
};

const SOURCE_LABEL: Record<string, string> = {
  live: 'LIVE · ClickHouse',
  demo: 'DÉMO EXPLICITE',
  unavailable: 'INDISPONIBLE'
};

export default function CellDetailModal({
  open,
  title,
  subtitle,
  kind,
  cells,
  anomalies,
  source,
  error,
  onClose,
  onIsolate,
  onExported
}: CellDetailModalProps) {
  const worst = useMemo(() => worstAnomaly(anomalies), [anomalies]);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(worst?.cellId ?? null);
  const [isolateBusy, setIsolateBusy] = useState(false);
  const [isolateMessage, setIsolateMessage] = useState('');
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setSelectedCellId(worst?.cellId ?? cells[0]?.cell_id ?? null);
    setIsolateMessage('');
    setIsolateBusy(false);
    closeRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const selectedCell = cells.find((c) => c.cell_id === selectedCellId) ?? null;
  const selectedAnomaly = selectedCell ? anomalies.find((a) => a.cellId === selectedCell.cell_id) ?? null : null;
  const nominal = NOMINAL_VOLTAGE[kind];

  const download = () => {
    const csv = buildIeeeCsv(title, kind, cells, anomalies);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qinode-powershield-${title.replace(/[^\w.-]+/g, '_')}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onExported?.(cells.length);
  };

  const isolate = async () => {
    if (!worst || isolateBusy) return;
    setIsolateBusy(true);
    try {
      const message = await onIsolate(worst);
      setIsolateMessage(message);
    } finally {
      setIsolateBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#030712]/85 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-[#0B1220] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0B1220] px-5 py-3">
          <div>
            <h3 className="text-[15px] font-bold text-slate-100">{title}</h3>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                source === 'live'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : source === 'demo'
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                    : 'border-red-500/40 bg-red-500/10 text-red-300'
              }`}
            >
              {SOURCE_LABEL[source] ?? source}
            </span>
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Fermer"
              className="rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {source === 'unavailable' && (
            <p className="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-[12px] text-red-200">
              Source indisponible{error ? ` — ${error}` : ''}. Les cellules remontées au backend ClickHouse s’afficheront ici dès que la chaîne alimente la base.
            </p>
          )}

          {worst && (
            <div
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                worst.severity === 'critical'
                  ? 'border-red-500 bg-red-950/50'
                  : 'border-amber-500 bg-amber-950/40'
              }`}
            >
              <span className={`mt-0.5 ${worst.severity === 'critical' ? 'text-red-400' : 'text-amber-400'}`}>
                <WarningOctagon size={20} />
              </span>
              <div className="flex-1 text-[12px]">
                <p className={`font-bold ${worst.severity === 'critical' ? 'text-red-300' : 'text-amber-300'}`}>
                  {worst.severity === 'critical'
                    ? 'CELLULE EN DÉFAUT DÉTECTÉE (détection locale DyAD)'
                    : 'DÉRIVE SURVEILLÉE (détection locale DyAD)'}
                </p>
                <p className="mt-0.5 text-slate-300">
                  Cellule <strong className="text-white">{worst.cellId}</strong> — {worst.reason}. Seuils : ΔV ≥ 0,25 V,
                  T ≥ 37 °C, SoC &lt; 20 % (nominal {nominal.toFixed(2)} V).
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Procédures : isoler le sous-ensemble via relais optique (ordre gated) ou planifier un remplacement à chaud.
                </p>
              </div>
            </div>
          )}

          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Cellules supervisées ({cells.length})
            </p>
            {cells.length === 0 ? (
              <p className="text-[12px] text-slate-500">
                Aucune cellule remontée pour cette chaîne — vérifier l’ingestion ClickHouse
                (table <code className="font-mono">battery_cells</code>).
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {cells.map((cell) => {
                  const severity = cellSeverity(String(cell.cell_id), anomalies);
                  const isSelected = selectedCellId === cell.cell_id;
                  const base = 'rounded-lg border p-2 text-center transition';
                  const tone =
                    severity === 'critical'
                      ? 'border-red-500 bg-red-950/70 text-red-200'
                      : severity === 'warning'
                        ? 'border-amber-500 bg-amber-950/50 text-amber-200'
                        : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-cyan-500';
                  return (
                    <button
                      key={cell.cell_id}
                      onClick={() => setSelectedCellId(String(cell.cell_id))}
                      className={`${base} ${tone} ${isSelected ? 'ring-2 ring-cyan-400' : ''}`}
                    >
                      <span className="block text-[10px] text-slate-400">{cell.cell_id}</span>
                      <span
                        className={`block font-mono text-[12px] font-bold ${
                          severity === 'critical' ? 'text-red-300' : 'text-emerald-300'
                        }`}
                      >
                        {Number(cell.voltage).toFixed(2)} V
                      </span>
                      <span className="block text-[9px] font-bold">
                        {severity === 'ok' ? 'OK' : severity === 'warning' ? 'Alerte' : 'Critique'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-[11px] sm:grid-cols-5">
            <div>
              <p className="text-slate-400">Cellule</p>
              <p className="text-[13px] font-bold text-cyan-300">{selectedCell ? selectedCell.cell_id : '—'}</p>
            </div>
            <div>
              <p className="text-slate-400">Tension</p>
              <p className="font-mono text-[13px] font-bold text-slate-100">
                {selectedCell ? `${Number(selectedCell.voltage).toFixed(2)} V` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Température</p>
              <p className="font-mono text-[13px] font-bold text-slate-100">
                {selectedCell ? `${Number(selectedCell.temp).toFixed(1)} °C` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">SoC</p>
              <p className="font-mono text-[13px] font-bold text-slate-100">
                {selectedCell && Number.isFinite(Number(selectedCell.soc))
                  ? `${Number(selectedCell.soc).toFixed(0)} %`
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">État DyAD</p>
              <p
                className={`text-[13px] font-bold ${
                  selectedAnomaly?.severity === 'critical'
                    ? 'text-red-400'
                    : selectedAnomaly
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                }`}
              >
                {selectedAnomaly
                  ? selectedAnomaly.severity === 'critical'
                    ? 'Critique'
                    : 'Surveillance'
                  : 'OK'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t border-slate-800 bg-[#0B1220] px-5 py-3">
          {isolateMessage && <p className="text-[11px] text-amber-300">{isolateMessage}</p>}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              onClick={download}
              disabled={cells.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] text-slate-200 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <DownloadSimple size={14} />
              Exporter (préparation revue IEEE 1188, .csv)
            </button>
            <button
              onClick={isolate}
              disabled={!worst || isolateBusy}
              className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-[11px] font-bold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ShieldCheck size={14} />
              {isolateBusy ? 'Envoi en cours…' : 'Préparer l’isolation (relais optique)'}
            </button>
          </div>
          <p className="flex items-center gap-1 text-[10px] text-slate-500">
            <Warning size={11} />
            L’ordre d’isolation est journalisé et reste bloqué tant que le connecteur optique n’est pas configuré
            (BMS_URL + BMS_WRITE=1).
          </p>
        </div>
      </div>
    </div>
  );
}
