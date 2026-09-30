# Démarre le web (Next) branché sur le gateway Rust + ClickHouse locaux
# (mode « lecture parallèle » Nest/Rust).
# Usage : powershell -ExecutionPolicy Bypass -File ops/local/windows/start-web-rust.ps1
param(
  [string]$RustGatewayUrl = 'http://127.0.0.1:8088',
  [string]$ClickHouseUrl = 'http://127.0.0.1:8123',
  [string]$Port = '3100'
)

$env:GRAPHQL_UPSTREAM = 'rust'
$env:RUST_GATEWAY_URL = $RustGatewayUrl
$env:GRAPHQL_INTERNAL_URL = 'http://127.0.0.1:4001/graphql'
$env:CLICKHOUSE_URL = $ClickHouseUrl
$env:CLICKHOUSE_DB = 'dcim'

Set-Location (Join-Path $PSScriptRoot '..\..\..\web')
npx next start -p $Port
