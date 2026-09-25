'use client';
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-20">
      <h1 className="text-[28px] font-bold">Erreur de page</h1>
      <p className="mt-3 text-[#444]">Le module n’a pas pu être rendu. Revenez à l’accueil ou réessayez.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={() => reset()} className="px-4 py-2 bg-[#0176D3] text-white rounded text-[13px]">Réessayer</button>
        <a href="/fr" className="px-4 py-2 border rounded text-[13px]">Accueil</a>
      </div>
    </div>
  );
}
