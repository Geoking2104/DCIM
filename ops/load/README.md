# Gateway load smoke (k6)

First brick of the performance work required before production
(NFR-PERF-001: "SLOs shall be defined and load-tested before production";
the initial target is p95 < 500 ms on topology reads, see
[docs/operations-readiness.md](../../docs/operations-readiness.md)).

The scenario is **read-only** and keeps a modest load (5 VUs, 30 s by
default) so it can run in CI and on developer machines:

- `GET /health/live` — liveness round-trip;
- `POST /graphql` — `{ racks { id name heightU siteId } }`.

Thresholds (k6 exits non-zero when they fail):

| Metric | Threshold |
| --- | --- |
| `http_req_failed` | < 1 % |
| `http_req_duration{name:graphql}` | p95 < 500 ms |

## Run it

```bash
# Install k6: https://grafana.com/docs/k6/latest/set-up/install-k6/
# Self-contained (boots the gateway on 127.0.0.1:8088, needs Neo4j):
bash ops/load/run-smoke.sh

# Against an already-running gateway:
BASE_URL=http://127.0.0.1:8088 VUS=10 DURATION=1m k6 run ops/load/k6-smoke.js
```

In CI it runs in the `Rust workspace` job right after the HTTP and WebSocket
smokes (k6 installed via `grafana/setup-k6-action`).

## Next steps towards a real load test

- grow the scenario set (subscriptions, telemetry ingest, mixed reads/writes);
- run longer ramping profiles against a staging environment;
- ratify the SLOs with real traffic and business impact, then make the
  thresholds contractual (`docs/operations-readiness.md`).
