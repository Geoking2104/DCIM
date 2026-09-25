export default function RootNotFound() {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui', background: '#F8FAFC', color: '#032D60', padding: 48 }}>
        <p style={{ fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#0176D3' }}>404</p>
        <h1 style={{ fontSize: 32 }}>Page introuvable</h1>
        <p><a href="/fr" style={{ color: '#0176D3' }}>Retour a l accueil</a></p>
        <p><a href="/fr/outils" style={{ color: '#0176D3' }}>Calculs PUE / WUE</a></p>
      </body>
    </html>
  );
}
