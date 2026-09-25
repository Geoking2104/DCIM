'use client';
import { useEffect, useState } from 'react';
import { ClassifiedGraphQLError } from '@/lib/graphqlErrors';
import { getWsPhase, onWsPhase, WsPhase } from '@/lib/wsLifecycle';

export default function GraphQLStatus({
  error,
  loading,
  live,
  lastEvent
}: {
  error?: ClassifiedGraphQLError | null;
  loading?: boolean;
  live?: boolean;
  lastEvent?: string;
}) {
  const [ws, setWs] = useState<{ phase: WsPhase; detail: string }>(getWsPhase());
  useEffect(() => onWsPhase((phase, detail) => setWs({ phase, detail })), []);

  const wsBadge =
    ws.phase === 'connected' ? 'bg-[#E6F8E9] text-[#0B7E25] WS' :
    ws.phase === 'connecting' ? 'bg-[#E6F2FE] text-[#0176D3] WS…' :
    ws.phase === 'error' ? 'bg-[#FFF0F0] text-[#C23934] WS' :
    ws.phase === 'closed' ? 'bg-[#FFF0C2] text-[#7A4E00] WS' :
    'bg-[#F3F3F3] text-[#444] WS';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`slds-badge ${wsBadge}`}>{ws.phase === 'idle' ? 'WS idle' : ws.phase}</span>
      {live && <span className="slds-badge bg-[#E6F8E9] text-[#0B7E25]">LIVE</span>}
      {!live && loading && !error && <span className="slds-badge bg-[#E6F2FE] text-[#0176D3]">…</span>}
      {!live && !loading && !error && <span className="slds-badge bg-[#FFF0C2] text-[#7A4E00]">MOCK</span>}
      {error && <span className="slds-badge bg-[#FFF0F0] text-[#C23934]">{error.kind}</span>}
      {lastEvent && <span className="slds-badge bg-[#F3F3F3] text-[10px]">{lastEvent}</span>}
    </span>
  );
}
