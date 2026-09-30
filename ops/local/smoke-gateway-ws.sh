#!/usr/bin/env bash
# Smoke WS : démarre le gateway Rust, exécute l'aller-retour de subscription
# (rackUpdated), puis l'arrête. Miroir local + CI.
# Usage : bash ops/local/smoke-gateway-ws.sh   (LISTEN=127.0.0.1:8089 pour un port de test)
set -u

NEO4J_URI="${NEO4J_URI:-bolt://127.0.0.1:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-qinode-dev-password}"
LISTEN="${LISTEN:-127.0.0.1:8088}"
export NEO4J_URI NEO4J_USER NEO4J_PASSWORD LISTEN
export KEYCLOAK_OPTIONAL="${KEYCLOAK_OPTIONAL:-true}"
export WS_URL="ws://${LISTEN}/graphql/ws"
export HTTP_URL="http://${LISTEN}/graphql"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

cd "$ROOT/crates" || exit 1
./target/debug/qinode-gateway > /tmp/gateway-ws-smoke.log 2>&1 &
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
  echo "Gateway non disponible apres 60 s"; tail -n 50 /tmp/gateway-ws-smoke.log
  kill "$GW_PID" 2>/dev/null || true
  exit 1
fi

cd "$ROOT/ops/local/mock-gql" || exit 1
if [ ! -d node_modules ]; then
  npm ci --silent 2>/dev/null || npm install --silent
fi
node smoke-gateway-ws.mjs
RC=$?
kill "$GW_PID" 2>/dev/null || true
exit $RC
