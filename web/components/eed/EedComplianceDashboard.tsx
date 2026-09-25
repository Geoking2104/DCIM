'use client';

import React, { useState } from 'react';
import type { EedMetricsData, EUEnergyLabel } from '@/lib/eedDemo';

const PUE_BANDS: Array<{ rank: EUEnergyLabel; maxPue: number; color: string }> = [
  { rank: 'A', maxPue: 1.15, color: 'bg-emerald-600' },
  { rank: 'B', maxPue: 1.25, color: 'bg-green-500' },
  { rank: 'C', maxPue: 1.35, color: 'bg-lime-500' },
  { rank: 'D', maxPue: 1.5, color: 'bg-yellow-400' },
  { rank: 'E', maxPue: 1.7, color: 'bg-amber-500' },
  { rank: 'F', maxPue: 1.9, color: 'bg-orange-500' },
  { rank: 'G', maxPue: Infinity, color: 'bg-red-600' }
];

function LabelScale({
  title,
  value,
  unit,
  active,
  bands
}: {
  title: string;
  value: number;
  unit: string;
  active: EUEnergyLabel;
  bands: typeof PUE_BANDS;
}) {
  return (
    <div className="bg-[#032D60] text-white rounded p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-[14px] font-bold">{title}</h3>
        <span className="slds-badge bg-[#FFF0C2] text-[#7A4E00]">official=false</span>
      </div>
      <div className="space-y-1">
        {bands.map((item, index) => (
          <div
            key={item.rank}
            className={`flex items-center justify-between px-3 py-1 rounded-r text-[11px] font-bold text-white ${item.color} ${
              item.rank === active ? 'ring-2 ring-white scale-[1.02]' : 'opacity-40'
            }`}
            style={{ width: `${55 + index * 6}%` }}
          >
            <span>Classe {item.rank}</span>
            <span className="font-mono">{item.maxPue === Infinity ? `> ${bands[bands.length - 2].maxPue}` : `≤ ${item.maxPue}`}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-white/20 flex justify-between">
        <div>
          <div className="text-[10px] uppercase opacity-70">{unit}</div>
          <div className="text-[28px] font-black font-mono">{value.toFixed(2)}</div>
        </div>
        <div className="text-right text-[11px] opacity-80 max-w-[160px]">
          Preview interne. Le label / QR officiel est émis par la base UE, pas par Qinode.
        </div>
      </div>
    </div>
  );
}

function WasteHeatGauge({ data }: { data: EedMetricsData }) {
  const met = data.erfPercentage >= data.erfTargetPercentage;
  return (
    <div className="bg-white border rounded p-5">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[14px]">Réutilisation chaleur (ERF)</h3>
        <span className={`slds-badge ${met ? 'bg-[#E6F8E9] text-[#0B7E25]' : 'bg-[#FFF0C2] text-[#7A4E00]'}`}>
          {met ? 'Cible locale atteinte' : 'Sous cible locale'}
        </span>
      </div>
      <p className="text-[11px] text-[#706E6B] mt-1">{data.erfTargetScope}</p>
      <div className="mt-4">
        <div className="flex justify-between text-[11px] font-mono text-[#706E6B]">
          <span>ERF {data.erfPercentage.toFixed(1)}%</span>
          <span>Cible {data.erfTargetPercentage}%</span>
        </div>
        <div className="h-3 bg-[#F3F3F3] rounded mt-1 overflow-hidden">
          <div className={`h-3 ${met ? 'bg-[#2E844A]' : 'bg-[#DD7A01]'}`} style={{ width: `${Math.min(data.erfPercentage * 4, 100)}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-[12px]">
        <div className="border rounded p-3">
          <div className="text-[10px] uppercase text-[#706E6B]">Chaleur exportée</div>
          <div className="font-mono font-bold">{data.reusedHeatGwh.toFixed(2)} GWh/an</div>
        </div>
        <div className="border rounded p-3">
          <div className="text-[10px] uppercase text-[#706E6B]">WUE preview</div>
          <div className="font-mono font-bold">{data.wue.toFixed(2)} L/kWh</div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-[#444] flex justify-between border-t pt-3">
        <span>CUE</span>
        <span className="font-mono">{data.cue.toFixed(3)} kgCO₂e/kWh</span>
      </div>
    </div>
  );
}

function ExportCard({ data }: { data: EedMetricsData }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="bg-white border rounded p-5">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-[14px]">Export registre européen</h3>
        <span className="slds-badge bg-[#E6F2FE] text-[#0176D3]">dry-run JSON</span>
      </div>
      <dl className="mt-4 text-[12px] space-y-2">
        <div className="flex justify-between border-b pb-1"><dt className="text-[#706E6B]">Site</dt><dd className="font-mono">{data.siteId}</dd></div>
        <div className="flex justify-between border-b pb-1"><dt className="text-[#706E6B]">ID UE</dt><dd className="font-mono">{data.euDatacenterID}</dd></div>
        <div className="flex justify-between border-b pb-1"><dt className="text-[#706E6B]">Formule</dt><dd className="font-mono text-right max-w-[220px]">{data.formulaVersion}</dd></div>
        <div className="flex justify-between"><dt className="text-[#706E6B]">Revue tierce</dt><dd>{data.isAuditVerified ? 'Oui' : 'Non — pas d’auto-certification'}</dd></div>
      </dl>
      <button
        onClick={() => {
          setBusy(true);
          setTimeout(() => {
            setBusy(false);
            setDone(true);
            const blob = new Blob(
              [JSON.stringify({ official: false, siteId: data.siteId, pue: data.currentPue, wue: data.currentWue, disclaimer: 'Internal preview. Not an official EU label.' }, null, 2)],
              { type: 'application/json' }
            );
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `eed-preview-${data.siteId}.json`;
            a.click();
          }, 800);
        }}
        className="mt-5 w-full py-2.5 bg-[#0176D3] text-white rounded text-[13px] font-semibold"
      >
        {busy ? 'Préparation…' : done ? 'Preview téléchargé' : 'Télécharger le payload preview'}
      </button>
      <p className="text-[11px] text-[#706E6B] mt-2">N’imite pas le label / QR officiel. Dépôt autorité = workflow humain séparé.</p>
    </div>
  );
}

export default function EedComplianceDashboard({ data }: { data: EedMetricsData }) {
  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">Règlement (UE) 2024/1364</div>
          <h2 className="text-[22px] font-bold">Tableau de bord EED · previews PUE / WUE</h2>
          <p className="text-[12px] text-[#706E6B]">Site {data.siteName} · A–G séparés · official=false</p>
        </div>
        <span className="slds-badge bg-[#FFF0C2] text-[#7A4E00]">Jeu de démo · PAS un label UE</span>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <LabelScale title="PUE preview" value={data.currentPue} unit="PUE annuel" active={data.puePreviewLabel} bands={PUE_BANDS} />
        <WasteHeatGauge data={data} />
        <ExportCard data={data} />
      </div>
    </section>
  );
}
