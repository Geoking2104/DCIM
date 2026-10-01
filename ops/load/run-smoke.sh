#!/usr/bin/env bash
# Self-contained load smoke: boots the gateway, runs the k6 smoke against it,
# then stops it. Requires k6 on PATH (CI installs it via grafana/setup-k6-action).
# Usage: bash ops/load/run-smoke.sh     (LISTEN=127.0.0.1:8092 for another port)
set -u

NEO4J_URI="${NEO4J_URI:-bolt://127.0.0.1:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-qinode-dev-password}"
LISTEN="${LISTEN:-127.0.0.1:8088}"
export NEO4J_URI NEO4J_USER NEO4J_PASSWORD LISTEN
export KEYCLOAK_OPTIONAL="${KEYCLOAK_OPTIONAL:-true}"
export BASE_URL="http://${LISTEN}"

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 introuvable sur le PATH - voir ops/load/README.md"
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cd "$ROOT/crates" || exit 1
./target/debug/qinode-gateway > /tmp/gateway-load-smoke.log 2>&1 &
GW_PID=$!

READY=0
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "http://${LISTEN}/health"; then
    READY=1
    break
  fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  echo "Gateway non disponible apres 60 s"; tail -n 50 /tmp/gateway-load-smoke.log
  kill "$GW_PID" 2>/dev/null || true
  exit 1
fi

k6 run "$ROOT/ops/load/k6-smoke.js"
RC=$?
kill "$GW_PID" 2>/dev/null || true
exit $RC
