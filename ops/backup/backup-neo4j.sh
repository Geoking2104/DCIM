#!/usr/bin/env bash
# Offline Neo4j dump (Community edition procedure).
# Stops the server, dumps the database with neo4j-admin, restarts it.
# The dump file path is printed as the last line.
#
# Required:  NEO4J_HOME       path to the Neo4j installation
# Optional:  NEO4J_DATABASE   database name (default: neo4j)
#            NEO4J_BACKUP_DIR target directory (default: $HOME/neo4j-backups)
#            NEO4J_HTTP       readiness URL (default: http://127.0.0.1:7474)
#            JAVA_HOME        JRE used by Neo4j (auto-discovered next to NEO4J_HOME)
set -euo pipefail

NEO4J_HOME="${NEO4J_HOME:?NEO4J_HOME must point to the Neo4j installation}"
NEO4J_DATABASE="${NEO4J_DATABASE:-neo4j}"
NEO4J_BACKUP_DIR="${NEO4J_BACKUP_DIR:-$HOME/neo4j-backups}"
NEO4J_HTTP="${NEO4J_HTTP:-http://127.0.0.1:7474}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$NEO4J_BACKUP_DIR/$STAMP"

log() { echo "[backup-neo4j] $*" >&2; }

if [ -z "${JAVA_HOME:-}" ]; then
  JRE_DIR="$(ls -d "$(dirname "$NEO4J_HOME")"/jdk-*-jre 2>/dev/null | head -n1 || true)"
  if [ -n "$JRE_DIR" ]; then export JAVA_HOME="$JRE_DIR"; fi
fi
if [ -n "${JAVA_HOME:-}" ]; then export PATH="$JAVA_HOME/bin:$PATH"; fi

is_up() { curl -sf -o /dev/null --max-time 3 "$NEO4J_HTTP"; }

was_running=0
if is_up; then was_running=1; fi

restart_if_needed() {
  if [ "$was_running" = "1" ] && ! is_up; then
    log "restarting Neo4j"
    "$NEO4J_HOME/bin/neo4j" start >/dev/null 2>&1 || true
    for _ in $(seq 1 60); do
      if is_up; then break; fi
      sleep 2
    done
    if is_up; then
      log "Neo4j is back up"
    else
      log "WARNING: Neo4j did not come back within 120 s - check the server manually"
    fi
  fi
}
trap restart_if_needed EXIT

if [ "$was_running" = "1" ]; then
  log "stopping Neo4j for the offline dump"
  "$NEO4J_HOME/bin/neo4j" stop >/dev/null
  for _ in $(seq 1 30); do
    if ! is_up; then break; fi
    sleep 2
  done
  if is_up; then
    log "server still up after 'neo4j stop' - aborting"
    exit 1
  fi
fi

mkdir -p "$DEST"
log "dumping database '$NEO4J_DATABASE' to $DEST"
"$NEO4J_HOME/bin/neo4j-admin" database dump "$NEO4J_DATABASE" \
  --to-path="$DEST" --overwrite-destination=true >&2

DUMP="$DEST/$NEO4J_DATABASE.dump"
if [ ! -s "$DUMP" ]; then
  log "dump file missing or empty: $DUMP"
  exit 1
fi

log "dump complete: $DUMP ($(stat -c %s "$DUMP") bytes)"
echo "$DUMP"
