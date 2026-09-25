'use client';

export default function LocaleError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] max-w-[720px] mx-auto px-6 py-20">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">Erreur de rendu</p>
      <h1 className="mt-2 text-[28px] font-extrabold">Cette page a bloque</h1>
      <p className="mt-3 text-slate-600">{error?.message || 'Le module n a pas pu etre rendu.'}</p>
      {error?.digest ? <p className="mt-2 text-[12px] text-slate-400">Ref {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => reset()} className="px-5 py-2.5 bg-[#0176D3] text-white rounded-full text-[13px] font-semibold">
          Reessayer
        </button>
        <a href="/fr" className="px-5 py-2.5 border rounded-full text-[13px] font-semibold">Accueil</a>
        <a href="/fr/outils" className="px-5 py-2.5 border rounded-full text-[13px] font-semibold">Calculs</a>
      </div>
    </div>
  );
}
