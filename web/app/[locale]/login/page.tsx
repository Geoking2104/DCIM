'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('ops@qinode.eu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function nextPath() {
    if (typeof window === 'undefined') return '/fr/plateforme';
    return new URLSearchParams(window.location.search).get('next') || '/fr/plateforme';
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, next: nextPath() })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Connexion refusée');
      return;
    }
    window.location.href = data.next || nextPath();
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] grid place-items-center px-4">
      <div className="w-full max-w-[420px] bg-white border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#032D60] text-white font-extrabold grid place-items-center">Q</div>
          <div>
            <div className="font-extrabold">QINODE.EU</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-widest">Connexion</div>
          </div>
        </div>

        <a
          href={`/api/auth/keycloak?next=${encodeURIComponent(nextPath())}`}
          className="block w-full text-center bg-[#032D60] text-white rounded-full py-2.5 text-[14px] font-semibold"
        >
          Continuer avec Keycloak (OAuth2)
        </a>
        <p className="mt-2 text-[11px] text-slate-500 text-center">OIDC • Authorization Code + PKCE</p>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-widest text-slate-400">
          <span className="flex-1 h-px bg-slate-200" /> ou mot de passe démo <span className="flex-1 h-px bg-slate-200" />
        </div>

        <form onSubmit={onSubmit}>
          <label className="block text-[12px] font-semibold mb-1">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[14px] mb-4" type="email" required />
          <label className="block text-[12px] font-semibold mb-1">Mot de passe</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[14px]" type="password" required />
          {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
          <button disabled={busy} className="mt-6 w-full border rounded-full py-2.5 text-[14px] font-semibold">
            {busy ? 'Connexion…' : 'Entrer (compte local)'}
          </button>
        </form>
      </div>
    </main>
  );
}
