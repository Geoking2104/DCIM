#!/usr/bin/env bash
# Isolated ClickHouse restore exercise: online backup, restore under a
# temporary database name, compare per-table row counts and max timestamps,
# then drop the restored database. Source data is never modified.
# Acceptance reference: docs/operations-readiness.md (restore assurance).
#
# Optional:  CLICKHOUSE_URL  (default http://127.0.0.1:8123)
#            CLICKHOUSE_DB   (default dcim)
#            CH_BACKUP_PATH  (default /var/lib/clickhouse/backups)
#            CH_KEEP_BACKUP  (default 1; set 0 to delete the archive afterwards)
set -euo pipefail

CH_URL="${CLICKHOUSE_URL:-http://127.0.0.1:8123}"
CH_DB="${CLICKHOUSE_DB:-dcim}"
CHECK_DB="${CH_DB}_restore_check"
CH_BACKUP_PATH="${CH_BACKUP_PATH:-/var/lib/clickhouse/backups}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
log() { echo "[exercise-clickhouse] $*"; }

q()     { curl -s "$CH_URL/" --data-binary "$1"; }
qline() { curl -sG "$CH_URL/" --data-urlencode "query=$1" | tr -d '\r\n'; }

tables="$(curl -sG "$CH_URL/" --data-urlencode "query=SHOW TABLES FROM $CH_DB" | tr -d '\r')"
if [ -z "$tables" ]; then
  log "no tables found in $CH_DB - nothing to exercise"
fi

log "capturing source invariants (tables: $(printf '%s' "$tables" | tr '\n' ' '))"
declare -A src_count src_max dtcol
for t in $tables; do
  src_count[$t]="$(qline "SELECT count() FROM $CH_DB.\`$t\`")"
  dt="$(qline "SELECT name FROM system.columns WHERE database='$CH_DB' AND table='$t' AND (type LIKE 'DateTime%' OR type LIKE 'Date%') LIMIT 1")"
  if [ -n "$dt" ]; then
    dtcol[$t]="$dt"
    src_max[$t]="$(qline "SELECT max(\`$dt\`) FROM $CH_DB.\`$t\`")"
  fi
done

log "running backup-clickhouse.sh"
BACKUP_FILE="$(CH_BACKUP_PATH="$CH_BACKUP_PATH" bash "$SCRIPT_DIR/backup-clickhouse.sh" | tail -n1)"
if [ -z "$BACKUP_FILE" ]; then
  log "no backup produced"
  exit 1
fi

q "DROP DATABASE IF EXISTS $CHECK_DB"
log "restoring as $CHECK_DB from $BACKUP_FILE"
RESULT="$(q "RESTORE DATABASE $CH_DB AS $CHECK_DB FROM File('$BACKUP_FILE')")"
if ! printf '%s' "$RESULT" | grep -q "RESTORED"; then
  log "restore failed"
  echo "$RESULT"
  exit 1
fi

status=PASS
echo
echo "== ClickHouse restore exercise report =="
for t in $tables; do
  dcount="$(qline "SELECT count() FROM $CHECK_DB.\`$t\`")"
  line="$t: count source=${src_count[$t]} restored=$dcount"
  if [ "${src_count[$t]}" != "$dcount" ]; then
    status=FAIL
    line="$line  <-- MISMATCH"
  fi
  if [ -n "${dtcol[$t]:-}" ]; then
    dmax="$(qline "SELECT max(\`${dtcol[$t]}\`) FROM $CHECK_DB.\`$t\`")"
    line="$line; max(${dtcol[$t]}) source=${src_max[$t]} restored=$dmax"
    if [ "${src_max[$t]}" != "$dmax" ]; then
      status=FAIL
      line="$line  <-- MISMATCH"
    fi
  fi
  echo "$line"
done

log "dropping $CHECK_DB"
q "DROP DATABASE IF EXISTS $CHECK_DB"

if [ "$status" = "PASS" ]; then
  echo "EXERCISE-RESULT: PASS"
else
  echo "EXERCISE-RESULT: FAIL"
  exit 1
fi

if [ "${CH_KEEP_BACKUP:-1}" = "1" ]; then
  log "backup kept: $BACKUP_FILE"
else
  rm -f "$BACKUP_FILE" 2>/dev/null || true
  log "backup removed (when the archive is on the local filesystem)"
fi
