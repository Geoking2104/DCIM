#!/usr/bin/env bash
# Smoke boot du gateway Rust - miroir de l'étape CI.
# Prérequis : `cargo build -p qinode-gateway` déjà exécuté, Neo4j joignable.
# Usage : bash ops/local/smoke-gateway.sh   (LISTEN=127.0.0.1:8089 pour un port de test)
set -u

NEO4J_URI="${NEO4J_URI:-bolt://127.0.0.1:7687}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-qinode-dev-password}"
LISTEN="${LISTEN:-127.0.0.1:8088}"
export NEO4J_URI NEO4J_USER NEO4J_PASSWORD LISTEN
export KEYCLOAK_OPTIONAL="${KEYCLOAK_OPTIONAL:-true}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/crates" || exit 1

./target/debug/qinode-gateway > /tmp/gateway-smoke.log 2>&1 &
GW_PID=$!
BASE="http://${LISTEN}"
READY=0
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "${BASE}/health"; then
    READY=1
    break
  fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  echo "Gateway non disponible apres 60 s"; tail -n 50 /tmp/gateway-smoke.log
  kill "$GW_PID" 2>/dev/null || true
  exit 1
fi

RESPONSE=$(curl -sf -X POST "${BASE}/graphql" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { createRack(input: {name: \"CI-SMOKE-RUST\", heightU: 42, siteId: \"ci\"}) { id name heightU siteId } }"}')
echo "$RESPONSE"
echo "$RESPONSE" | grep -q '"createRack"' || { echo "createRack (rust) a echoue"; kill "$GW_PID" 2>/dev/null || true; exit 1; }

QUERY=$(curl -sf -X POST "${BASE}/graphql" \
  -H 'content-type: application/json' \
  --data '{"query":"{ racks { id name heightU siteId } }"}')
echo "$QUERY"
echo "$QUERY" | grep -q 'CI-SMOKE-RUST' || { echo "lecture racks a echoue"; kill "$GW_PID" 2>/dev/null || true; exit 1; }
kill "$GW_PID" 2>/dev/null || true
echo "smoke-gateway OK"
