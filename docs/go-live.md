# Go-live checklist

Consolidated, trackable view of what remains before a production go-live.
Acceptance sources: [Production operations readiness](operations-readiness.md)
(release, SLO, backup and security gates), the
[Functional Requirements Document](functional-requirements.md) and the
[Technical Architecture](technical-architecture.md).

Last review: 2026-10-01.

## Scope levels

| Level | Definition | Gate |
| --- | --- | --- |
| **A — Public demo** | Web + gateway reachable on a domain, explicit demo/live data policy, no client data | Section A decisions + B1-B3 |
| **B — Client pilot** | Real on-site data for one site/tenant | All of A, plus B4-B7 |
| **C — Scaled production** | HA, DR, regulatory evidence | All of A+B, plus C1-C5 |

Legend: `[x]` done with evidence · `[~]` in progress / partially delivered ·
`[ ]` to do · **Decision** marks items that require a product or
infrastructure choice.

## A. Decisions and provisioning

- [ ] **Decision — hosting target.** Kubernetes baseline exists
  (`crates/deploy/kubernetes/qinode-gateway.yaml`, two replicas, probes, PDB)
  vs a single VM running Docker Compose. No environment is provisioned yet.
- [ ] **Decision — domains and TLS.** Names for web/api/ws/keycloak, DNS
  wiring, managed certificates, ingress. Vercel can host the web app.
- [ ] **Keycloak production realm.** Create the realm, the web and collector
  clients and mappers; set `KEYCLOAK_OPTIONAL=false` outside local/demo; retire
  the local `AUTH_PASSWORD` login. Groundwork: `web/keycloak/`.
- [ ] **Secrets management.** Provision the deployment secret manager
  (`NEO4J_PASSWORD`, ClickHouse credentials, Grafana SMTP...). The repository
  contains no production Secret manifest; do not copy development credentials.
- [ ] **Decision — Neo4j edition.** Community (offline dumps inside a
  maintenance window) vs Enterprise (online backup).

## B. Operability

- [x] **B1 — Backup/restore tooling with an automated isolated restore
  exercise.** `ops/backup/` ships the Neo4j offline dump, the ClickHouse
  File-engine backup, and two isolated restore exercises that verify counts,
  timestamps and a sampled rack and exit non-zero on drift. First local
  exercise: 2026-10-01 (`EXERCISE-RESULT: PASS`, see
  [ops/backup/README.md](../ops/backup/README.md)). Recurring gate: run both
  exercises at least quarterly; record RPO/RTO.
- [x] **B2 — Image publishing (ghcr, digest).** `.github/workflows/publish.yml`
  builds and pushes `ghcr.io/<owner>/qinode-gateway` on `v*` tags or on manual
  dispatch, smokes the published image (liveness + readiness against real
  Neo4j/ClickHouse services) and prints the immutable digest for pinning.
- [~] **B3 — Load testing (NFR-PERF-001).** First brick shipped: `ops/load/`
  k6 smoke (health + racks read, thresholds p95 < 500 ms / errors < 1 %) runs
  in the Rust CI job. Remaining: ramping profiles on a staging environment and
  SLO ratification against real traffic.
- [ ] **B4 — Retention policy** for ClickHouse/Neo4j (and archival of evidence
  tables) before storing client data.
- [ ] **B5 — Observability bring-up.** Deploy the monitoring overlay
  (Prometheus/Grafana/Telegraf, alert rules → `POST /api/alerts`), configure
  contact points (SMTP or webhook) and external synthetic checks.
- [ ] **B6 — On-site hardware validation.** Redfish/SNMP/BMS ingestion against
  real equipment (all current validation is simulated).
- [ ] **B7 — Disaster recovery exercise.** Full DR runbook beyond isolated
  restores, with recorded RTO.

## C. Product completions (scope-dependent)

- [ ] **C1 — Decision: tenant scoping of the remaining REST/web data routes**
  (blocking for multi-tenant pilots).
- [ ] **C2 — Durable multi-pod subscription bus.** Redpanda is declared in
  `docker-compose.yml`; required for HA subscriptions, not for a single-pod
  pilot.
- [ ] **C3 — Nest retirement cleanup.** Canonical property convention; remove
  the camelCase/snake_case bridges (`crates/qinode-graph`,
  `dcim-topology-service/src/topology/property-bridge.ts`).
- [ ] **C4 — Regulatory evidence engine** (P1 "Next"): versioned rules,
  data-quality gates, locked snapshots, four-eyes review, EU/national exports,
  submission receipts, label reconciliation.
- [ ] **C5 — Demo-pages inventory.** List the UI paths still serving documented
  demo data before a client pilot (fail-visible by design).

## Recently completed

| Date | Item | Evidence |
| --- | --- | --- |
| 2026-10-01 | RustSec advisory audit in CI (`cargo audit` gate) | `security.yml`, `crates/.cargo/audit.toml` |
| 2026-10-01 | Backup/restore tooling + isolated restore exercises | `ops/backup/`, exercise logs |
| 2026-10-01 | ghcr image publishing with digest + published-image smoke | `.github/workflows/publish.yml` |
| 2026-10-01 | k6 load smoke (read path) wired into CI | `ops/load/` |
| 2026-09-30 | Gateway WebSocket smoke promoted to CI (Rust job) | `ops/local/smoke-gateway-ws.sh` |
| 2026-09-30 | Local ops runbook, WSL/mock tooling, Windows scripts | `ops/local/` |

Before starting a rollout, follow the release checklist in
[operations-readiness.md](operations-readiness.md#release-and-incident-checklist).
