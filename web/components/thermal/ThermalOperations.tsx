'use client';

import { useMemo, useState } from 'react';
import {
  ArrowCounterClockwise,
  ArrowsOutCardinal,
  Bell,
  Brain,
  CheckCircle,
  CursorClick,
  Drop,
  Fire,
  Gauge,
  Lightning,
  List,
  MagnifyingGlassPlus,
  HardDrives,
  Pulse,
  SlidersHorizontal,
  Snowflake,
  SpeakerHigh,
  SpeakerSlash,
  Stack,
  Thermometer,
  Wind,
  X,
} from '@phosphor-icons/react';
import ThermalScene, { type ThermalLayers } from './ThermalScene';
import {
  balanceRackLoads,
  createInitialRacks,
  maxExhaustTemperature,
  rackFromLoad,
  updateRackLoad,
} from '@/lib/thermalModel';

type Incident = {
  id: string;
  rackId: string;
  title: string;
  detail: string;
};

type PanelName = 'layers' | 'assistant' | null;

const panelClass =
  'border border-slate-700/70 bg-[#070d19]/90 shadow-2xl shadow-black/40 backdrop-blur-xl';

function Switch({
  checked,
  color,
  label,
  onChange,
}: {
  checked: boolean;
  color: string;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-4 w-8 shrink-0 rounded-full border transition ${checked ? color : 'border-slate-600 bg-slate-800'}`}
    >
      <span
        className={`absolute top-[1px] h-3 w-3 rounded-full bg-white shadow transition ${checked ? 'left-[17px]' : 'left-[1px]'}`}
      />
    </button>
  );
}

function MetricCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex min-w-[150px] items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/85 px-3 py-1.5">
      <span className={tone}>{icon}</span>
      <span>
        <span className="block text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        <span className={`block font-mono text-[11px] font-bold ${tone}`}>{value}</span>
      </span>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center justify-between text-[11px] text-slate-400">
        <span>{label}</span>
        <span className="font-mono font-semibold text-cyan-300">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-cyan-500"
      />
    </label>
  );
}

export default function ThermalOperations({ locale }: { locale: string }) {
  const [racks, setRacks] = useState(createInitialRacks);
  const [layers, setLayers] = useState<ThermalLayers>({
    coldAir: true,
    hotAir: true,
    waterPipes: true,
    dissipation: true,
    heatmap: true,
  });
  const [flowSpeed, setFlowSpeed] = useState(10);
  const [density, setDensity] = useState(100);
  const [heatmapOpacity, setHeatmapOpacity] = useState(70);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resetNonce, setResetNonce] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [optimized, setOptimized] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<PanelName>(null);

  const selectedRack = useMemo(
    () => racks.find((rack) => rack.id === selectedRackId) ?? null,
    [racks, selectedRackId],
  );
  const maximumTemperature = maxExhaustTemperature(racks);
  const averageLoad = racks.reduce((sum, rack) => sum + rack.loadPct, 0) / racks.length;
  const pue = (1.055 + averageLoad / 2300).toFixed(2);
  const hasIncident = incidents.length > 0;

  const updateLayer = (layer: keyof ThermalLayers, value: boolean) => {
    setLayers((current) => ({ ...current, [layer]: value }));
  };

  const injectHotspot = () => {
    setRacks((current) => updateRackLoad(current, 'B-04', 100));
    setSelectedRackId('B-04');
    setIncidents([
      {
        id: 'thermal-b04',
        rackId: 'B-04',
        title: 'Exhaust threshold exceeded',
        detail: '35.7 °C · predicted recirculation in cold aisle B',
      },
    ]);
    setOptimized(false);
  };

  const boostCooling = () => {
    setRacks((current) =>
      current.map((rack) =>
        rack.exhaustTemp >= 35
          ? rackFromLoad(rack.id, rack.row, rack.x, Math.max(52, rack.loadPct - 34))
          : rack,
      ),
    );
    setIncidents([]);
    setOptimized(true);
  };

  const randomizeLoads = () => {
    setRacks((current) =>
      current.map((rack) => rackFromLoad(rack.id, rack.row, rack.x, 42 + Math.random() * 49)),
    );
    setIncidents([]);
    setOptimized(false);
  };

  const applyOptimization = () => {
    setRacks((current) => balanceRackLoads(current));
    setIncidents([]);
    setOptimized(true);
  };

  const layersPanel = (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-200">
          <SlidersHorizontal size={15} className="text-cyan-300" />
          HVAC & thermal layers
        </h2>
        <span className="font-mono text-[9px] text-cyan-300">SIMULATION</span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5"><Wind size={14} className="text-cyan-300" />Cold supply air vectors</span>
          <Switch checked={layers.coldAir} color="border-cyan-500 bg-cyan-600" label="Cold supply air vectors" onChange={(value) => updateLayer('coldAir', value)} />
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5"><Fire size={14} className="text-rose-400" />Hot exhaust air plumes</span>
          <Switch checked={layers.hotAir} color="border-rose-500 bg-rose-600" label="Hot exhaust air plumes" onChange={(value) => updateLayer('hotAir', value)} />
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5"><Drop size={14} className="text-blue-400" />Chilled water hydronic loop</span>
          <Switch checked={layers.waterPipes} color="border-blue-500 bg-blue-600" label="Chilled water hydronic loop" onChange={(value) => updateLayer('waterPipes', value)} />
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5"><Pulse size={14} className="text-amber-300" />Chassis thermal dissipation</span>
          <Switch checked={layers.dissipation} color="border-amber-500 bg-amber-600" label="Chassis thermal dissipation" onChange={(value) => updateLayer('dissipation', value)} />
        </div>
        <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-300">
          <span className="flex items-center gap-1.5"><Stack size={14} className="text-emerald-300" />3D heatmap volume mesh</span>
          <Switch checked={layers.heatmap} color="border-emerald-500 bg-emerald-600" label="3D heatmap volume mesh" onChange={(value) => updateLayer('heatmap', value)} />
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-800 pt-3">
        <Slider label="Air & water flow velocity" value={flowSpeed} min={2} max={30} display={`${(flowSpeed / 10).toFixed(1)}x`} onChange={setFlowSpeed} />
        <Slider label="Particle vector density" value={density} min={20} max={100} display={`${density}%`} onChange={setDensity} />
        <Slider label="Heatmap volume opacity" value={heatmapOpacity} min={0} max={100} display={`${heatmapOpacity}%`} onChange={setHeatmapOpacity} />
      </div>

      <div className="space-y-2 border-t border-slate-800 pt-3">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-200">Thermal stress testing</span>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={injectHotspot} className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-800 bg-rose-950/60 px-2 py-2 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-900/80">
            <Fire size={14} />Inject hotspot
          </button>
          <button type="button" onClick={boostCooling} className="flex items-center justify-center gap-1.5 rounded-lg border border-cyan-800 bg-cyan-950/60 px-2 py-2 text-[11px] font-semibold text-cyan-300 transition hover:bg-cyan-900/80">
            <Snowflake size={14} />CRAH boost
          </button>
        </div>
        <button type="button" onClick={randomizeLoads} className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-slate-700">
          <ArrowsOutCardinal size={14} className="text-cyan-300" />Randomize compute load
        </button>
      </div>
    </div>
  );

  const assistantPanel = (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-cyan-500/35 bg-slate-900/90 p-3 shadow-lg shadow-cyan-950/30">
        <span className="absolute right-0 top-0 rounded-bl-lg border-b border-l border-cyan-800 bg-cyan-950 px-2 py-0.5 font-mono text-[8px] text-cyan-300">DETERMINISTIC POLICY PREVIEW</span>
        <h2 className="mb-3 flex items-center gap-2 pt-1 text-[11px] font-bold text-slate-100">
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-400" /></span>
          <Brain size={15} className="text-cyan-300" />Thermal decision assistant
        </h2>
        <div className="grid grid-cols-3 rounded border border-slate-800 bg-slate-950/80 p-2 text-center font-mono text-[9px]">
          <span><span className="block text-slate-600">CONFIDENCE</span><strong className="text-emerald-400">{hasIncident ? '99.2%' : '97.1%'}</strong></span>
          <span><span className="block text-slate-600">LATENCY</span><strong className="text-cyan-300">13.7 ms</strong></span>
          <span><span className="block text-slate-600">POLICY</span><strong className={hasIncident ? 'text-rose-400' : 'text-emerald-400'}>{hasIncident ? 'MITIGATE' : 'BALANCED'}</strong></span>
        </div>
        <span className="mb-1.5 mt-3 block text-[9px] font-bold uppercase tracking-wide text-slate-500">Deterministic action plan</span>
        <div className="flex items-start gap-2 rounded border border-slate-800 bg-slate-950/90 p-2.5 text-[11px] leading-relaxed text-slate-200">
          {hasIncident ? <Fire size={16} className="mt-0.5 shrink-0 text-rose-400" /> : <CheckCircle size={16} className="mt-0.5 shrink-0 text-emerald-400" />}
          <p>
            <strong className={hasIncident ? 'text-rose-300' : 'text-emerald-300'}>{hasIncident ? 'Mitigation required: ' : optimized ? 'Workload rebalanced: ' : 'System nominal: '}</strong>
            {hasIncident
              ? 'Move 18% of B-04 workload to row A and raise CRAH-02 airflow before exhaust exceeds 37 °C.'
              : optimized
                ? 'Rack load variance is below 4%. Cold and hot aisle delta-T is back inside the scenario guardrail.'
                : 'Cold/hot aisle airflow containment is balanced. No thermal anomaly is predicted in the next 60 minutes.'}
          </p>
        </div>
        <button type="button" onClick={applyOptimization} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-2 text-[11px] font-bold text-white shadow-lg shadow-emerald-950/40 transition hover:brightness-110">
          <Lightning size={15} weight="fill" />Apply workload rebalance
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-200"><Bell size={15} className="text-rose-400" />Active incident stream</h2>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${hasIncident ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-300'}`}>{incidents.length} ACTIVE</span>
        </div>
        {incidents.length === 0 ? (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400"><CheckCircle size={15} className="text-emerald-400" />No active thermal or power anomalies.</div>
        ) : (
          incidents.map((incident) => (
            <button key={incident.id} type="button" onClick={() => setSelectedRackId(incident.rackId)} className="w-full rounded-lg border border-rose-800/70 bg-rose-950/40 p-3 text-left transition hover:bg-rose-950/70">
              <span className="block text-[11px] font-bold text-rose-300">{incident.rackId} · {incident.title}</span>
              <span className="mt-1 block text-[10px] text-slate-400">{incident.detail}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-[720px] h-[100dvh] overflow-hidden bg-[#020617] font-sans text-slate-100 selection:bg-cyan-500/30">
      <header className="relative z-20 flex h-14 items-center justify-between border-b border-slate-800/90 bg-slate-950/95 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <a href={`/${locale}/plateforme`} aria-label="Back to Qinode platform" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 via-emerald-500 to-indigo-600 text-sm font-black text-white shadow-lg shadow-cyan-500/20">Q</a>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <strong className="truncate text-[13px] tracking-wide text-slate-100">Qinode.eu DCIM</strong>
              <span className="hidden rounded-full border border-cyan-800/70 bg-cyan-950/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-cyan-300 sm:block">3D thermal · scenario twin</span>
            </div>
            <p className="truncate text-[10px] text-slate-500">Thermal simulation, HVAC flux and workload planning</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 xl:flex">
          <MetricCard icon={<Lightning size={15} />} label="Global PUE / WUE" value={`${pue} / 0.21 m³/MWh`} tone="text-cyan-300" />
          <MetricCard icon={<Drop size={15} />} label="Water temp (in / out)" value="7.2 °C / 11.0 °C" tone="text-blue-400" />
          <MetricCard icon={<Thermometer size={15} />} label="Max exhaust" value={`${maximumTemperature.toFixed(1)} °C`} tone={maximumTemperature >= 35 ? 'text-rose-400' : 'text-amber-300'} />
          <MetricCard icon={<Pulse size={15} />} label="Model latency" value="13.7 ms" tone="text-emerald-400" />
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setMobilePanel(mobilePanel === 'layers' ? null : 'layers')} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-cyan-300 lg:hidden" aria-label="Open thermal layers"><List size={16} /></button>
          <button type="button" onClick={() => setMobilePanel(mobilePanel === 'assistant' ? null : 'assistant')} className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-emerald-300 xl:hidden" aria-label="Open thermal assistant"><Brain size={16} /></button>
          <button type="button" onClick={() => setAudioEnabled((value) => !value)} aria-pressed={audioEnabled} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 p-2 text-[11px] text-slate-300 transition hover:bg-slate-800">
            {audioEnabled ? <SpeakerHigh size={15} className="text-cyan-300" /> : <SpeakerSlash size={15} />}
            <span className="hidden sm:inline">Audio {audioEnabled ? 'on' : 'off'}</span>
          </button>
          <button type="button" onClick={() => setResetNonce((value) => value + 1)} className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-[11px] text-slate-200 transition hover:bg-slate-700">
            <ArrowCounterClockwise size={14} /><span className="hidden sm:inline">Reset view</span>
          </button>
        </div>
      </header>

      <div className="relative h-[calc(100%-3.5rem)]">
        <ThermalScene
          racks={racks}
          layers={layers}
          flowSpeed={flowSpeed}
          density={density}
          heatmapOpacity={heatmapOpacity}
          resetNonce={resetNonce}
          selectedRackId={selectedRackId}
          onSelectRack={(rack) => setSelectedRackId(rack.id)}
        />

        <aside className={`absolute left-4 top-4 z-10 hidden max-h-[calc(100%-2rem)] w-80 overflow-y-auto rounded-xl p-4 lg:block ${panelClass}`}>{layersPanel}</aside>
        <aside className={`absolute right-4 top-4 z-10 hidden max-h-[calc(100%-2rem)] w-96 overflow-y-auto rounded-xl p-4 xl:block ${panelClass}`}>{assistantPanel}</aside>

        {mobilePanel && (
          <aside className={`absolute inset-x-4 top-4 z-30 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl p-4 lg:left-auto lg:w-80 xl:hidden ${panelClass}`}>
            <button type="button" onClick={() => setMobilePanel(null)} className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close panel"><X size={16} /></button>
            {mobilePanel === 'layers' ? layersPanel : assistantPanel}
          </aside>
        )}

        {selectedRack && (
          <aside className={`absolute bottom-16 right-4 z-20 w-[min(340px,calc(100%-2rem))] rounded-xl p-4 transition xl:right-[416px] ${panelClass}`}>
            <div className="flex items-start justify-between border-b border-slate-800 pb-2">
              <span><strong className="flex items-center gap-2 text-[12px] text-slate-100"><HardDrives size={15} className="text-cyan-300" />{selectedRack.id} · Row {selectedRack.row}</strong><small className="text-[9px] text-slate-500">Rack telemetry & workload scenario</small></span>
              <button type="button" onClick={() => setSelectedRackId(null)} className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Close rack inspector"><X size={15} /></button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2"><span className="block text-[9px] text-slate-500">INTAKE TEMP</span><strong className="font-mono text-[12px] text-cyan-300">{selectedRack.intakeTemp.toFixed(1)} °C</strong></div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/90 p-2"><span className="block text-[9px] text-slate-500">EXHAUST TEMP</span><strong className={`font-mono text-[12px] ${selectedRack.exhaustTemp >= 35 ? 'text-rose-400' : 'text-amber-300'}`}>{selectedRack.exhaustTemp.toFixed(1)} °C</strong></div>
            </div>
            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5">
              <div className="mb-1.5 flex justify-between text-[10px]"><span className="text-slate-400">Power draw</span><span className="font-mono text-slate-200">{selectedRack.powerKw.toFixed(1)} kW / 12 kW</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className={`h-full transition-all ${selectedRack.loadPct >= 90 ? 'bg-rose-500' : 'bg-cyan-500'}`} style={{ width: `${selectedRack.loadPct}%` }} /></div>
            </div>
            <div className="mt-2 rounded-lg border border-slate-800 bg-slate-900/90 p-2.5">
              <Slider label="Workload load factor" value={selectedRack.loadPct} min={10} max={100} display={`${selectedRack.loadPct}%`} onChange={(value) => setRacks((current) => updateRackLoad(current, selectedRack.id, value))} />
            </div>
          </aside>
        )}

        <div className="absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 rounded-full border border-slate-700/70 bg-[#070d19]/90 px-4 py-2 text-[10px] text-slate-400 backdrop-blur-xl md:flex">
          <span className="flex items-center gap-1.5"><CursorClick size={14} className="text-cyan-300" />Click: rotate / inspect</span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5"><Gauge size={14} className="text-cyan-300" />Right click: pan</span>
          <span className="text-slate-700">|</span>
          <span className="flex items-center gap-1.5"><MagnifyingGlassPlus size={14} className="text-cyan-300" />Scroll: zoom</span>
        </div>
      </div>
    </main>
  );
}
