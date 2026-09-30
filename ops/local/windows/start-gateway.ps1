# Démarre le gateway Rust contre Neo4j + ClickHouse locaux.
# Usage : powershell -ExecutionPolicy Bypass -File ops/local/windows/start-gateway.ps1
param(
  [string]$Neo4jUri = $(if ($env:NEO4J_URI) { $env:NEO4J_URI } else { 'bolt://127.0.0.1:7687' }),
  [string]$Neo4jUser = 'neo4j',
  [string]$Neo4jPassword = $(if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { 'qinode-dev-password' }),
  [string]$ClickHouseUrl = 'http://127.0.0.1:8123',
  [string]$Listen = '0.0.0.0:8088'
)

$env:NEO4J_URI = $Neo4jUri
$env:NEO4J_USER = $Neo4jUser
$env:NEO4J_PASSWORD = $Neo4jPassword
$env:CLICKHOUSE_URL = $ClickHouseUrl
$env:CLICKHOUSE_DB = 'dcim'
$env:KEYCLOAK_OPTIONAL = 'true'
$env:LISTEN = $Listen

Set-Location (Join-Path $PSScriptRoot '..\..\..\crates')
.\target\debug\qinode-gateway.exe
