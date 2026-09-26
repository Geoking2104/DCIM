'use client';
import { useEffect, useState } from 'react';

export default function BmsPanel() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/bms/points')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) return <p className="text-[13px] text-[#706E6B]">Lecture des points…</p>;

  return (
    <div className="space-y-6">
      <div className="text-[13px]">
        Lien BMS : <strong>{data.connected ? data.protocol : 'démo (pas de BMS_URL)'}</strong>
        {' · '}boucle fermée : non
      </div>
      <table className="w-full text-[13px] bg-white border">
        <thead className="text-left text-[11px] uppercase text-[#706E6B]">
          <tr>
            <th className="p-3">Point</th>
            <th className="p-3">Proto</th>
            <th className="p-3">Valeur</th>
            <th className="p-3">Écriture</th>
          </tr>
        </thead>
        <tbody>
          {(data.points || []).map((p: any) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">
                <div className="font-mono text-[11px]">{p.id}</div>
                <div>{p.name}</div>
              </td>
              <td className="p-3">{p.proto}</td>
              <td className="p-3 font-bold">{p.value} {p.unit}</td>
              <td className="p-3">{p.writeable ? 'oui (bloquée)' : 'lecture'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2 className="font-bold mb-2">Écritures en attente (prédictif)</h2>
        {(data.pendingWrites || []).length === 0 && (
          <p className="text-[13px] text-[#706E6B]">Aucune action planifiée.</p>
        )}
        <ul className="space-y-2 text-[13px]">
          {(data.pendingWrites || []).map((w: any, i: number) => (
            <li key={i} className="bg-white border p-3">
              <span className="font-mono text-[11px]">{w.target || 'n/a'}</span> — {w.action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
