export default function CoverIcon({ name, className = 'w-7 h-7' }: { name: string; className?: string }) {
  const p = { viewBox: '0 0 24 24', className, fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'eye': return <svg {...p}><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>;
    case 'trend': return <svg {...p}><path d="M3 17 9 11l4 4 8-8" /><path d="M14 7h7v7" /></svg>;
    case 'search': return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3-3" /></svg>;
    case 'bolt': return <svg {...p}><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></svg>;
    case 'thermo': return <svg {...p}><path d="M10 14.5V6a2 2 0 1 1 4 0v8.5a3.5 3.5 0 1 1-4 0Z" /></svg>;
    case 'rack': return <svg {...p}><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M8 7h8M8 12h8M8 17h8" /></svg>;
    case 'box': return <svg {...p}><path d="M21 8 12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /></svg>;
    case 'cable': return <svg {...p}><path d="M4 8h6l2 8h8" /><circle cx="4" cy="8" r="2" /><circle cx="20" cy="16" r="2" /></svg>;
    case 'lock': return <svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>;
    case 'place': return <svg {...p}><path d="M4 20V8l8-4 8 4v12" /><path d="M9 20v-6h6v6" /></svg>;
    case 'calendar': return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case 'plug': return <svg {...p}><path d="M8 2v5M16 2v5M7 7h10v6a5 5 0 0 1-10 0V7Z" /><path d="M12 18v4" /></svg>;
    case 'euro': return <svg {...p}><path d="M18 6a7 7 0 1 0 0 12" /><path d="M6 10h8M6 14h8" /></svg>;
    case 'gauge': return <svg {...p}><path d="M5 19a8 8 0 1 1 14 0" /><path d="M12 19 16 9" /></svg>;
    case 'file': return <svg {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></svg>;
    case 'link': return <svg {...p}><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" /><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" /></svg>;
    case 'cube': return <svg {...p}><path d="M12 3 4 7v10l8 4 8-4V7Z" /><path d="M12 21V11M4 7l8 4 8-4" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}
