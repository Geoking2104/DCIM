#!/usr/bin/env bash
# Isolated Neo4j restore exercise: offline dump the live database, load it
# into a scratch instance on separate ports, verify counts and a sampled
# rack, then tear the scratch instance down.
# Acceptance reference: docs/operations-readiness.md (restore assurance).
#
# Required:  NEO4J_HOME
#            NEO4J_PASSWORD for the source server (or rely on defaults)
# Optional:  NEO4J_USER (default: neo4j), NEO4J_DATABASE (default: neo4j)
#            NEO4J_BACKUP_DIR, SCRATCH_DIR (default: $HOME/neo4j-restore-check)
#            NEO4J_HTTP / DST_HTTP / SRC_BOLT / DST_BOLT endpoint overrides
#            KEEP_SCRATCH=1 to keep the scratch instance for inspection
set -euo pipefail

NEO4J_HOME="${NEO4J_HOME:?NEO4J_HOME must point to the Neo4j installation}"
NEO4J_USER="${NEO4J_USER:-neo4j}"
NEO4J_PASSWORD="${NEO4J_PASSWORD:-qinode-dev-password}"
NEO4J_DATABASE="${NEO4J_DATABASE:-neo4j}"
SCRATCH_DIR="${SCRATCH_DIR:-$HOME/neo4j-restore-check}"
SRC_HTTP="${SRC_HTTP:-http://127.0.0.1:7474}"
DST_HTTP="${DST_HTTP:-http://127.0.0.1:7475}"
SRC_BOLT="${SRC_BOLT:-bolt://127.0.0.1:7687}"
DST_BOLT="${DST_BOLT:-bolt://127.0.0.1:7688}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
log() { echo "[exercise-neo4j] $*"; }

# Safety: never point the scratch instance at the main installation.
case "$SCRATCH_DIR" in
  "$NEO4J_HOME"|"$NEO4J_HOME"/*)
    log "SCRATCH_DIR overlaps NEO4J_HOME - refusing to run"
    exit 1
    ;;
esac

if [ -z "${JAVA_HOME:-}" ]; then
  JRE_DIR="$(ls -d "$(dirname "$NEO4J_HOME")"/jdk-*-jre 2>/dev/null | head -n1 || true)"
  if [ -n "$JRE_DIR" ]; then export JAVA_HOME="$JRE_DIR"; fi
fi
if [ -n "${JAVA_HOME:-}" ]; then export PATH="$JAVA_HOME/bin:$PATH"; fi

src_val() {
  "$NEO4J_HOME/bin/cypher-shell" -a "$SRC_BOLT" -u "$NEO4J_USER" -p "$NEO4J_PASSWORD" \
    --format plain "$1" | sed -n '2p' | tr -d '"' | sed 's/^ *//; s/ *$//'
}
dst_val() {
  # The scratch instance runs with auth disabled; credentials are ignored.
  "$NEO4J_HOME/bin/cypher-shell" -a "$DST_BOLT" -u neo4j -p neo4j-check \
    --format plain "$1" | sed -n '2p' | tr -d '"' | sed 's/^ *//; s/ *$//'
}

scratch_started=0
cleanup_scratch() {
  if [ "$scratch_started" = "1" ]; then
    log "stopping scratch instance"
    NEO4J_CONF="$SCRATCH_DIR/conf" "$NEO4J_HOME/bin/neo4j" stop >/dev/null 2>&1 || true
  fi
}
trap cleanup_scratch EXIT

curl -sf -o /dev/null --max-time 3 "$SRC_HTTP" || {
  log "source Neo4j is not reachable at $SRC_HTTP - start it first"
  exit 1
}

log "capturing source invariants"
SRC_NODES="$(src_val 'MATCH (n) RETURN count(n) AS c')"
SRC_RACKS="$(src_val 'MATCH (r:Rack) RETURN count(r) AS c')"
SRC_RELS="$(src_val 'MATCH ()-[rel]->() RETURN count(rel) AS c')"
SAMPLE_RACK="$(src_val 'MATCH (r:Rack) RETURN r.id ORDER BY r.id LIMIT 1')"
if [ -n "$SAMPLE_RACK" ]; then
  SAMPLE_NAME="$(src_val "MATCH (r:Rack) WHERE r.id = '$SAMPLE_RACK' RETURN r.name LIMIT 1")"
else
  SAMPLE_NAME=""
fi

log "running backup-neo4j.sh"
if ! BACKUP_OUT="$(NEO4J_BACKUP_DIR="${NEO4J_BACKUP_DIR:-$HOME/neo4j-backups}" bash "$SCRIPT_DIR/backup-neo4j.sh" | tail -n1)"; then
  log "backup-neo4j.sh failed"
  exit 1
fi
DUMP="$BACKUP_OUT"
if [ ! -s "$DUMP" ]; then
  log "no dump produced"
  exit 1
fi
log "dump: $DUMP"

log "preparing scratch instance at $SCRATCH_DIR"
rm -rf "$SCRATCH_DIR"
mkdir -p "$SCRATCH_DIR/data" "$SCRATCH_DIR/logs" "$SCRATCH_DIR/run" "$SCRATCH_DIR/import" "$SCRATCH_DIR/conf"
cp "$NEO4J_HOME/conf/neo4j.conf" "$SCRATCH_DIR/conf/neo4j.conf"
# Strip the settings we are about to override: Neo4j rejects duplicate keys.
{
  grep -vE '^[[:space:]]*(server\.default_listen_address|server\.http\.listen_address|server\.bolt\.listen_address|server\.directories\.(data|logs|run|import)|dbms\.security\.auth_enabled)[[:space:]]*=' "$NEO4J_HOME/conf/neo4j.conf"
  cat <<EOF

# --- restore exercise overrides ---
server.default_listen_address=127.0.0.1
server.http.listen_address=127.0.0.1:7475
server.bolt.listen_address=127.0.0.1:7688
server.directories.data=$SCRATCH_DIR/data
server.directories.logs=$SCRATCH_DIR/logs
server.directories.run=$SCRATCH_DIR/run
server.directories.import=$SCRATCH_DIR/import
dbms.security.auth_enabled=false
EOF
} > "$SCRATCH_DIR/conf/neo4j.conf"

log "loading dump into the scratch instance"
NEO4J_CONF="$SCRATCH_DIR/conf" "$NEO4J_HOME/bin/neo4j-admin" database load "$NEO4J_DATABASE" \
  --from-path="$(dirname "$DUMP")" --overwrite-destination=true

log "starting the scratch instance"
scratch_started=1
NEO4J_CONF="$SCRATCH_DIR/conf" "$NEO4J_HOME/bin/neo4j" start >/dev/null
READY=0
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null --max-time 2 "$DST_HTTP"; then
    READY=1
    break
  fi
  sleep 2
done
if [ "$READY" != "1" ]; then
  log "scratch instance did not start"
  tail -n 30 "$SCRATCH_DIR/logs/neo4j.log" 2>/dev/null || true
  exit 1
fi

log "verifying the restored data"
DST_NODES="$(dst_val 'MATCH (n) RETURN count(n) AS c')"
DST_RACKS="$(dst_val 'MATCH (r:Rack) RETURN count(r) AS c')"
DST_RELS="$(dst_val 'MATCH ()-[rel]->() RETURN count(rel) AS c')"
DST_SAMPLE_ID="$(dst_val 'MATCH (r:Rack) RETURN r.id ORDER BY r.id LIMIT 1')"
DST_SAMPLE_NAME=""
if [ -n "$SAMPLE_RACK" ]; then
  DST_SAMPLE_NAME="$(dst_val "MATCH (r:Rack) WHERE r.id = '$SAMPLE_RACK' RETURN r.name LIMIT 1")"
fi

echo
echo "== Neo4j restore exercise report =="
printf 'nodes:         source=%s restored=%s\n' "$SRC_NODES" "$DST_NODES"
printf 'racks:         source=%s restored=%s\n' "$SRC_RACKS" "$DST_RACKS"
printf 'relationships: source=%s restored=%s\n' "$SRC_RELS" "$DST_RELS"
printf 'sample rack:   %s (%s)\n' "$SAMPLE_RACK" "$SAMPLE_NAME"

status=PASS
[ "$SRC_NODES" = "$DST_NODES" ] || status=FAIL
[ "$SRC_RACKS" = "$DST_RACKS" ] || status=FAIL
[ "$SRC_RELS" = "$DST_RELS" ] || status=FAIL
[ "$SAMPLE_RACK" = "$DST_SAMPLE_ID" ] || status=FAIL
[ "$SAMPLE_NAME" = "$DST_SAMPLE_NAME" ] || status=FAIL
printf 'dump size:     %s bytes\n' "$(stat -c %s "$DUMP")"

if [ "$status" = "PASS" ]; then
  echo "EXERCISE-RESULT: PASS"
else
  echo "EXERCISE-RESULT: FAIL"
  exit 1
fi

if [ "${KEEP_SCRATCH:-0}" != "1" ]; then
  log "tearing down the scratch instance"
  NEO4J_CONF="$SCRATCH_DIR/conf" "$NEO4J_HOME/bin/neo4j" stop >/dev/null || true
  rm -rf "$SCRATCH_DIR"
else
  log "KEEP_SCRATCH=1: scratch kept at $SCRATCH_DIR (stop: NEO4J_CONF=$SCRATCH_DIR/conf $NEO4J_HOME/bin/neo4j stop)"
fi
