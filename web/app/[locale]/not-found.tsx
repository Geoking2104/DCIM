export default function LocaleNotFound() {
  return (
    <div className="min-h-[60vh] max-w-[720px] mx-auto px-6 py-20">
      <p className="text-[11px] font-bold uppercase tracking-widest text-[#0176D3]">404</p>
      <h1 className="mt-2 text-[28px] font-extrabold">Page introuvable</h1>
      <p className="mt-3 text-slate-600">Cette adresse n existe pas (ou le dernier deploiement ne l a pas encore publiee).</p>
      <ul className="mt-6 space-y-2 text-[14px]">
        <li><a className="text-[#0176D3] font-semibold" href="/fr">Accueil</a></li>
        <li><a className="text-[#0176D3] font-semibold" href="/fr/outils">Calculs rapides (PUE / WUE)</a></li>
        <li><a className="text-[#0176D3] font-semibold" href="/fr/outils/pue">Efficacite electrique</a></li>
        <li><a className="text-[#0176D3] font-semibold" href="/fr/outils/wue">Efficacite eau</a></li>
        <li><a className="text-[#0176D3] font-semibold" href="/fr/maturite">Diagnostic</a></li>
      </ul>
    </div>
  );
}
