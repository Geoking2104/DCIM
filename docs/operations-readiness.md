# Production operations readiness

This document defines the first P2 operating baseline. It is an acceptance checklist, not a claim that the current local Compose stack is a production platform.

## Health contract

| Endpoint | Purpose | Success | Failure behavior |
| --- | --- | --- | --- |
| `GET /health` | Backward-compatible liveness | HTTP 200 while the process can serve requests | Process/container restart if it stops responding |
| `GET /health/live` | Kubernetes and container liveness | HTTP 200 without calling dependencies | Restart only after consecutive failures |
| `GET /health/ready` | Traffic readiness | HTTP 200 only when Neo4j, ClickHouse, and Keycloak configuration are ready | HTTP 503; remove the instance from service endpoints |

Readiness responses expose only `ready` or `unavailable` per dependency. Detailed connection errors stay in structured application logs and must not be returned to unauthenticated callers.

Compose waits for Neo4j and ClickHouse healthchecks before starting the gateway, using the documented `service_healthy` dependency condition. The Kubernetes baseline runs two replicas, uses zero-unavailable rolling updates, and has a disruption budget.

## Initial service objectives

These targets must be ratified against real traffic and business impact before becoming contractual SLOs.

| Signal | Initial target | Alert proposal |
| --- | --- | --- |
| Gateway availability | 99.9% successful non-probe requests per calendar month | Fast burn: 2% errors for 15 min; slow burn: 0.5% for 2 h |
| Readiness | At least one ready replica; two during normal operation | Page if no ready replica for 5 min; ticket if redundancy is lost for 30 min |
| GraphQL latency | p95 below 500 ms for rack/topology reads | Warn above 500 ms for 15 min |
| Telemetry freshness | p95 newest power sample below 60 s old | Warn above 120 s for 10 min |
| Restore assurance | One successful isolated restore exercise per quarter | Page on failed scheduled backup; track overdue restore exercise |

Synthetic checks must exclude `/health/*` from the user-request success ratio. Deployments must record version/digest, environment, and rollout timestamps so incidents can be correlated with changes.

## Backup and restore policy

| Data | Minimum policy | Validation |
| --- | --- | --- |
| Neo4j topology | Daily full backup or dump, plus a production RPO appropriate to the licensed edition | Restore into an isolated instance, run consistency checks, then query known rack/device relationships |
| ClickHouse telemetry and evidence | Weekly full plus daily incremental backup to separate object storage; credentials through named collections or a secret manager | Restore into a separate database/cluster and compare row counts, time bounds, and sampled hashes |
| Configuration | Git-tracked non-secret configuration and versioned secret-manager metadata | Recreate a clean environment without copying a running container filesystem |

Neo4j Community supports offline dumps; online full/differential backup is an Enterprise capability. Choose the procedure that matches the deployed edition and document the maintenance window. See the [Neo4j backup and restore manual](https://neo4j.com/docs/operations-manual/current/backup-restore/).

ClickHouse supports full and incremental `BACKUP`/`RESTORE` workflows to configured disks or object storage. A backup is not accepted until an isolated restore has succeeded. See the [ClickHouse backup and restore documentation](https://clickhouse.com/docs/concepts/features/backup-restore/overview).

Never restore over a production database as the first validation step. Restore into an isolated target, verify application-level invariants, record achieved RPO/RTO, and obtain operator approval before a cutover.

## Security and deployment gates

- Terminate TLS with managed certificates; use encrypted service-to-service transport where the data services support it.
- Source `NEO4J_PASSWORD` and future ClickHouse credentials from the deployment secret manager. The repository contains no production Secret manifest.
- Keep `KEYCLOAK_OPTIONAL=false` outside local/demo environments. Missing Keycloak configuration makes readiness fail.
- Pin container images by immutable digest and scan them before promotion.
- Keep the runtime non-root, read-only, without Linux capabilities or a mounted service-account token unless explicitly required.
- Restrict ingress and egress with network policies or the service mesh.

## Release and incident checklist

Before promotion: CI green, database migrations or constraints applied, backup current, restore exercise within policy, capacity headroom checked, rollback image available, and dashboards/alerts active.

During an incident: preserve logs and timestamps, stop automated rollout, identify whether liveness or readiness failed, verify dependency health independently, and prefer traffic isolation over repeated restarts. After recovery, record the timeline, customer impact, root cause, corrective actions, and whether SLO/error-budget policy changes.
