'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', background: '#F8FAFC', color: '#032D60', padding: 48 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0176D3' }}>Erreur serveur</p>
        <h1 style={{ fontSize: 32, margin: '8px 0 12px' }}>La page n a pas pu s afficher</h1>
        <p style={{ color: '#475569', maxWidth: 480 }}>{error?.message || 'Erreur inattendue.'}</p>
        {error?.digest ? <p style={{ fontSize: 12, color: '#94a3b8' }}>Ref {error.digest}</p> : null}
        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button onClick={() => reset()} style={{ background: '#0176D3', color: '#fff', border: 0, borderRadius: 999, padding: '10px 18px' }}>
            Reessayer
          </button>
          <a href="/fr" style={{ border: '1px solid #cbd5e1', borderRadius: 999, padding: '10px 18px', textDecoration: 'none', color: '#032D60' }}>
            Accueil
          </a>
        </div>
      </body>
    </html>
  );
}
