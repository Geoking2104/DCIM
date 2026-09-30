# Démarre le web (Next) branché sur le service Nest + ClickHouse locaux.
# Usage : powershell -ExecutionPolicy Bypass -File ops/local/windows/start-web-nest.ps1
param(
  [string]$ClickHouseUrl = 'http://127.0.0.1:8123',
  [string]$Port = '3100'
)

$env:GRAPHQL_INTERNAL_URL = 'http://127.0.0.1:4001/graphql'
$env:CLICKHOUSE_URL = $ClickHouseUrl
$env:CLICKHOUSE_DB = 'dcim'

Set-Location (Join-Path $PSScriptRoot '..\..\..\web')
npx next start -p $Port
