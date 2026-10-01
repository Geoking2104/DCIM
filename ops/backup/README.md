# Backup and restore tooling

Executable procedures for the backup/restore policy in
[docs/operations-readiness.md](../../docs/operations-readiness.md) and for the
quarterly *isolated restore exercise* acceptance criterion ("a backup is not
accepted until an isolated restore has succeeded").

| Script | What it does | Where it runs |
| --- | --- | --- |
| [`backup-neo4j.sh`](backup-neo4j.sh) | Offline Neo4j dump: stops the server, runs `neo4j-admin database dump`, restarts it (also on failure) | On the Neo4j host (Linux/WSL) |
| [`exercise-neo4j.sh`](exercise-neo4j.sh) | Full restore exercise: dump → load into a scratch instance on separate ports → verify counts and a sampled rack → tear down | On the Neo4j host |
| [`backup-clickhouse.sh`](backup-clickhouse.sh) | Online ClickHouse backup: `BACKUP DATABASE ... TO File('...zip')` | Anywhere with HTTP access to the ClickHouse server |
| [`exercise-clickhouse.sh`](exercise-clickhouse.sh) | Full restore exercise: backup → restore as `<db>_restore_check` → compare per-table counts and max timestamps → drop the restored database | Same |

Both exercises print an `EXERCISE-RESULT: PASS|FAIL` line and exit non-zero on
any mismatch, so they can be wired into cron or CI.

## Prerequisites

**Neo4j (Community edition).** Online dumps are an Enterprise capability; the
Community procedure is an *offline* dump. `backup-neo4j.sh` therefore stops the
server while dumping and restarts it afterwards, including when the dump fails.
Set `NEO4J_HOME`; `JAVA_HOME` is auto-discovered from a `jdk-*-jre` directory
next to `NEO4J_HOME` (the tarball layout used by `ops/local/`). The restore
exercise additionally uses `NEO4J_USER` / `NEO4J_PASSWORD` to read source
invariants, and leaves the source database untouched.

**ClickHouse.** The `File` backup engine must be allowed to write to the target
path. Mount [`clickhouse-backups.xml`](clickhouse-backups.xml) into the
server's `config.d/` directory (already wired for the Docker Compose stack in
`docker-compose.yml`). Customize `allowed_path` for production (dedicated
backup volume). On clusters without that mount, add the same block manually.

## Usage

```bash
# Backups — the dump file / archive path is printed as the last line.
NEO4J_HOME=/opt/neo4j bash ops/backup/backup-neo4j.sh
CLICKHOUSE_URL=http://127.0.0.1:8123 CH_BACKUP_PATH=/var/lib/clickhouse/backups \
  bash ops/backup/backup-clickhouse.sh

# Restore exercises — exit non-zero on any mismatch.
NEO4J_HOME=/opt/neo4j NEO4J_PASSWORD=... bash ops/backup/exercise-neo4j.sh
bash ops/backup/exercise-clickhouse.sh
```

Environment variables (all optional except the noted ones):

| Variable | Default | Used by |
| --- | --- | --- |
| `NEO4J_HOME` (required) | — | Neo4j scripts |
| `NEO4J_DATABASE` | `neo4j` | Neo4j scripts |
| `NEO4J_BACKUP_DIR` | `$HOME/neo4j-backups` | Neo4j scripts |
| `NEO4J_USER` / `NEO4J_PASSWORD` | `neo4j` / — | `exercise-neo4j.sh` |
| `SCRATCH_DIR` | `$HOME/neo4j-restore-check` | `exercise-neo4j.sh` |
| `KEEP_SCRATCH` | `0` (delete) | `exercise-neo4j.sh` |
| `CLICKHOUSE_URL` | `http://127.0.0.1:8123` | ClickHouse scripts |
| `CLICKHOUSE_DB` | `dcim` | ClickHouse scripts |
| `CH_BACKUP_PATH` | `/var/lib/clickhouse/backups` | ClickHouse scripts |
| `CH_KEEP_BACKUP` | `1` (keep the archive) | `exercise-clickhouse.sh` |

## Local WSL2 example (the `ops/local/` dev instance)

```bash
cd /mnt/c/Users/geoff/.openclaw-autoclaw/workspace/repos/DCIM   # or your checkout

NEO4J_HOME=$HOME/neo4j-e2e/neo4j-community-5.26.0 \
NEO4J_PASSWORD=qinode-dev-password \
bash ops/backup/exercise-neo4j.sh

# The dev ClickHouse instance allows /tmp/ch-backups/ (see its config.xml).
CH_BACKUP_PATH=/tmp/ch-backups bash ops/backup/exercise-clickhouse.sh
```

## Production notes

- Neo4j Enterprise: replace the offline dump with an online
  `neo4j-admin database backup` (or scheduled backup service) and keep the
  same verify/compare structure for the exercise.
- ClickHouse: for object storage, swap `TO File` for `TO S3(...)` / `TO Disk(...)`
  in `backup-clickhouse.sh`; the File engine emits a single full archive, so
  weekly-full + daily-incremental needs a different schedule split.
- Record the achieved RPO/RTO of each exercise and keep the logs as evidence;
  never restore over the production database as the first validation step.
