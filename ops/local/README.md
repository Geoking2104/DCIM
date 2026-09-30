# Stack locale DCIM (WSL2, sans Docker)

Recette validée pour faire tourner **toute la pile** sur une machine Windows sans Docker :
ClickHouse + Neo4j dans WSL2, services Rust/Nest sur Windows, web dans le navigateur.

## Composants & ports

| Composant | Port(s) | Où | Recette |
|---|---|---|---|
| ClickHouse | 8123 | WSL2 | `docs/ingestion-durable.md` (§ Alternative sans Docker) |
| Neo4j 5.26 | 7687 / 7474 | WSL2 | ci-dessous |
| Mock GraphQL | 4000 | Windows | `ops/local/mock-gql` (bac à sable UI) |
| Service Nest (Topology API) | 4001 | Windows | ci-dessous |
| Gateway Rust | 8088 | Windows | ci-dessous |
| Web (Next) | 3100 | Windows | ci-dessous |

## Neo4j (WSL2)

```bash
mkdir -p ~/neo4j-e2e && cd ~/neo4j-e2e
curl -fsSL -o jre.tar.gz 'https://api.adoptium.net/v3/binary/latest/21/ga/linux/x64/jre/hotspot/normal/eclipse'
tar xzf jre.tar.gz
curl -fsSL -o neo4j.tar.gz 'https://dist.neo4j.org/neo4j-community-5.26.0-unix.tar.gz'
tar xzf neo4j.tar.gz

cd neo4j-community-5.26.0
bin/neo4j-admin dbms set-initial-password qinode-dev-password
# Joignable depuis Windows (comme ClickHouse) :
sed -i 's/^#\?server\.default_listen_address=.*/server.default_listen_address=0.0.0.0/' conf/neo4j.conf
```

Démarrage / arrêt / test :

```bash
bash ops/local/neo4j-wsl.sh start      # premier plan, laisser tourner
bash ops/local/neo4j-wsl.sh status
bash ops/local/neo4j-wsl.sh auth-test  # cypher-shell RETURN 1
bash ops/local/neo4j-wsl.sh stop
```

Depuis Windows : `http://localhost:7474` (HTTP) et **bolt sur l'IP WSL** si le relais
`localhost` n'est pas encore prêt : `wsl -d Ubuntu -- hostname -I` → `bolt://<ip>:7687`.

## Services

**Nest** (après `npm ci && npm run build` dans `dcim-topology-service`) :

```
NEO4J_URI=bolt://<wsl-ip>:7687  NEO4J_USERNAME=neo4j  NEO4J_PASSWORD=qinode-dev-password
PORT=4001  KEYCLOAK_OPTIONAL=true
node dist/main.js
```

**Gateway Rust** (après `cargo build -p qinode-gateway` dans `crates`) :

```
NEO4J_URI=bolt://<wsl-ip>:7687  NEO4J_USER=neo4j  NEO4J_PASSWORD=qinode-dev-password
CLICKHOUSE_URL=http://127.0.0.1:8123  CLICKHOUSE_DB=dcim
KEYCLOAK_OPTIONAL=true  LISTEN=0.0.0.0:8088
crates\target\debug\qinode-gateway.exe
```

`/health` (live) et `/health/ready` (ClickHouse + Neo4j + Keycloak) donnent l'état.

## Web

- **Build** : les URLs publiques sont figées à la compilation —
  `NEXT_PUBLIC_GRAPHQL_URL=http://127.0.0.1:4001/graphql`,
  `NEXT_PUBLIC_GRAPHQL_WS_URL=ws://127.0.0.1:4001/graphql` (mode Nest), puis `npm run build`.
- **Mode Nest** : `GRAPHQL_INTERNAL_URL=http://127.0.0.1:4001/graphql` (+
  `CLICKHOUSE_URL=http://127.0.0.1:8123`, `CLICKHOUSE_DB=dcim`) puis `npx next start -p 3100`.
- **Mode Rust** (lecture parallèle) : `GRAPHQL_UPSTREAM=rust`,
  `RUST_GATEWAY_URL=http://127.0.0.1:8088` — même UI, autre backend.

## Windows : lanceurs prêts

Des scripts PowerShell paramétrés couvrent les démarrages courants
(`ops/local/windows/` : service Nest, gateway, web en mode Nest ou Rust) —
voir [windows/README.md](windows/README.md).

## Smokes (miroir des étapes CI)

```bash
bash ops/local/smoke-nest.sh                 # PORT=4009 pour un port de test
bash ops/local/smoke-gateway.sh              # LISTEN=127.0.0.1:8089 idem
```

À lancer depuis **Git Bash** (Windows) ou WSL ; `NEO4J_URI`, `PORT`, `LISTEN`,
`NEO4J_PASSWORD` surchargent les défauts.

## Pièges connus (vécus)

- **PowerShell → WSL** : passer par des **scripts** (`.sh`) plutôt que des commandes
  inline (`$,`, `|`, espaces cassent l'échappement) ; guillemets simples PowerShell = verbatim.
- Neo4j doit écouter sur `0.0.0.0` pour être joignable depuis Windows.
- En développement : `KEYCLOAK_OPTIONAL=true` côté services **et** web, sinon les gardes
  rôles refusent (comportement voulu, fail-closed).
- Période de lecture parallèle : les lectures des deux services tolèrent les deux
  conventions de propriétés (`height_u`/`heightU`, `site_id`/`siteId`) — voir
  `crates/qinode-graph` et `dcim-topology-service/src/topology/property-bridge.ts`.

## Nettoyage

```bash
# côté WSL
pkill -f neo4j-community ; pkill clickhouse
# côté Windows : couper les processus écoutant sur 4000/4001/8088/3100
```
