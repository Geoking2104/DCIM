#!/usr/bin/env bash
# Smoke boot du service Nest (Topology API) - miroir de l'étape CI.
# Prérequis : `npm ci` + `npm run build` déjà exécutés, Neo4j joignable.
# Usage : bash ops/local/smoke-nest.sh   (PORT=4009 pour un port de test)
set -u

NEO4J_URI="${NEO4J_URI:-bolt://127.0.0.1:7687}"
NEO4J_USERNAME="${NEO4J_USERNAME:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-qinode-dev-password}"
PORT="${PORT:-4001}"
export NEO4J_URI NEO4J_USERNAME NEO4J_PASSWORD PORT
export KEYCLOAK_OPTIONAL="${KEYCLOAK_OPTIONAL:-true}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT/dcim-topology-service" || exit 1

node dist/main.js > /tmp/topology-smoke.log 2>&1 &
APP_PID=$!
READY=0
for _ in $(seq 1 30); do
  if curl -sf -o /dev/null -X POST "http://127.0.0.1:${PORT}/graphql" \
    -H 'content-type: application/json' --data '{"query":"{ racks { id name } }"}'; then
    READY=1
    break
  fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  echo "Service non disponible apres 60 s"; tail -n 50 /tmp/topology-smoke.log
  kill "$APP_PID" 2>/dev/null || true
  exit 1
fi

RESPONSE=$(curl -sf -X POST "http://127.0.0.1:${PORT}/graphql" \
  -H 'content-type: application/json' \
  --data '{"query":"mutation { createRack(input: {name: \"CI-SMOKE\", heightU: 42, siteId: \"ci\"}) { id name } }"}')
echo "$RESPONSE"
echo "$RESPONSE" | grep -q '"createRack"' || { echo "createRack a echoue"; kill "$APP_PID" 2>/dev/null || true; exit 1; }
kill "$APP_PID" 2>/dev/null || true
echo "smoke-nest OK"
