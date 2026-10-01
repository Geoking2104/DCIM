#!/usr/bin/env bash
# Online ClickHouse backup to the File engine (single zip archive).
# The server must allow the target path via backups.allowed_path
# (see ops/backup/clickhouse-backups.xml). The archive path is printed as
# the last line.
#
# Optional:  CLICKHOUSE_URL  (default http://127.0.0.1:8123)
#            CLICKHOUSE_DB   (default dcim)
#            CH_BACKUP_PATH  (default /var/lib/clickhouse/backups)
set -euo pipefail

CH_URL="${CLICKHOUSE_URL:-http://127.0.0.1:8123}"
CH_DB="${CLICKHOUSE_DB:-dcim}"
CH_BACKUP_PATH="${CH_BACKUP_PATH:-/var/lib/clickhouse/backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
DEST="$CH_BACKUP_PATH/$CH_DB-$STAMP.zip"

log() { echo "[backup-clickhouse] $*" >&2; }

RESULT="$(curl -s "$CH_URL/" --data-binary "BACKUP DATABASE $CH_DB TO File('$DEST')")"
if ! printf '%s' "$RESULT" | grep -q "BACKUP_CREATED"; then
  log "backup failed"
  echo "$RESULT"
  case "$RESULT" in
    *allowed_path*)
      log "hint: allow $CH_BACKUP_PATH via <backups><allowed_path> in the server config (see ops/backup/clickhouse-backups.xml)"
      ;;
  esac
  exit 1
fi

log "backup created: $DEST"
echo "$DEST"
