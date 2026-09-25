'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const params = useSearchParams();
  const next = params.get('next') || '/fr/plateforme';
  const [email, setEmail] = useState('ops@qinode.eu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, next })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || 'Connexion refusée');
      return;
    }
    window.location.href = data.next || next;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] grid place-items-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-[420px] bg-white border rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-lg bg-[#032D60] text-white font-extrabold grid place-items-center">Q</div>
          <div>
            <div className="font-extrabold">QINODE.EU</div>
            <div className="text-[11px] text-slate-500 uppercase tracking-widest">Connexion plateforme</div>
          </div>
        </div>
        <label className="block text-[12px] font-semibold mb-1">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[14px] mb-4" type="email" required />
        <label className="block text-[12px] font-semibold mb-1">Mot de passe</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-[14px]" type="password" required />
        {error && <p className="mt-3 text-[13px] text-red-600">{error}</p>}
        <button disabled={busy} className="mt-6 w-full bg-[#032D60] text-white rounded-full py-2.5 text-[14px] font-semibold">
          {busy ? 'Connexion…' : 'Entrer'}
        </button>
        <p className="mt-4 text-[11px] text-slate-500">Compte démo opérateur. L’accueil marketing reste public.</p>
      </form>
    </main>
  );
}
