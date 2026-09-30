# Démarre le service Nest (Topology API) contre le Neo4j local.
# Usage : powershell -ExecutionPolicy Bypass -File ops/local/windows/start-nest.ps1
param(
  [string]$Neo4jUri = $(if ($env:NEO4J_URI) { $env:NEO4J_URI } else { 'bolt://127.0.0.1:7687' }),
  [string]$Neo4jUser = 'neo4j',
  [string]$Neo4jPassword = $(if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { 'qinode-dev-password' }),
  [string]$Port = '4001'
)

$env:NEO4J_URI = $Neo4jUri
$env:NEO4J_USERNAME = $Neo4jUser
$env:NEO4J_PASSWORD = $Neo4jPassword
$env:PORT = $Port
$env:KEYCLOAK_OPTIONAL = 'true'

Set-Location (Join-Path $PSScriptRoot '..\..\..\dcim-topology-service')
node dist/main.js
