# Lanceurs Windows (PowerShell)

Scripts prêts à l'emploi pour la stack locale (voir `../README.md`).
Chaque script accepte des paramètres (URI Neo4j, mot de passe, ports…) avec des
défauts raisonnables ; le mot de passe est surchargeable par `NEO4J_PASSWORD`.

| Script | Cible |
|---|---|
| `start-nest.ps1` | Service Nest (Topology API) sur `:4001` |
| `start-gateway.ps1` | Gateway Rust sur `0.0.0.0:8088` |
| `start-web-nest.ps1` | Web (Next) sur `:3100`, proxy → Nest, données → ClickHouse |
| `start-web-rust.ps1` | Idem mais proxy → gateway Rust (mode lecture parallèle) |

```powershell
powershell -ExecutionPolicy Bypass -File ops/local/windows/start-nest.ps1
```

Prérequis : `npm ci && npm run build` (Nest), `cargo build -p qinode-gateway` (gateway),
`npm run build` (web) — et Neo4j/ClickHouse démarrés côté WSL (`../neo4j-wsl.sh`,
`../../docs/ingestion-durable.md`).
