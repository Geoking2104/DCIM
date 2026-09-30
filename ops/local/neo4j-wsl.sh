#!/usr/bin/env bash
# Gestion du Neo4j local (WSL2, sans Docker) pour la stack DCIM.
# Installation attendue sous ~/neo4j-e2e (voir ops/local/README.md).
# Usage : bash ops/local/neo4j-wsl.sh start|stop|status|auth-test
set -u

NEO4J_HOME="${NEO4J_HOME:-$HOME/neo4j-e2e/neo4j-community-5.26.0}"
JRE_DIR="$(ls -d "$HOME"/neo4j-e2e/jdk-*-jre 2>/dev/null | head -n1 || true)"

cmd="${1:-status}"

start_neo4j() {
  if [ -z "$JRE_DIR" ]; then echo "JRE introuvable sous ~/neo4j-e2e (voir README)"; exit 1; fi
  export JAVA_HOME="$JRE_DIR"
  export PATH="$JAVA_HOME/bin:$PATH"
  cd "$NEO4J_HOME" || exit 1
  exec bin/neo4j console
}

case "$cmd" in
  start) start_neo4j ;;
  stop)
    pkill -f 'neo4j-community' 2>/dev/null || true
    sleep 3
    pgrep -f 'neo4j-community' > /dev/null && echo "encore actif" || echo "Neo4j arrêté"
    ;;
  status)
    pgrep -af 'neo4j-community' | head -3 || echo "aucun processus neo4j"
    ss -ltn 2>/dev/null | grep -E '7687|7474' || echo "aucun listener 7687/7474"
    ;;
  auth-test)
    if [ -z "$JRE_DIR" ]; then echo "JRE introuvable"; exit 1; fi
    export JAVA_HOME="$JRE_DIR"; export PATH="$JAVA_HOME/bin:$PATH"
    cd "$NEO4J_HOME" || exit 1
    bin/cypher-shell -a bolt://127.0.0.1:7687 -u neo4j -p "${NEO4J_PASSWORD:-qinode-dev-password}" "RETURN 1 AS ok"
    ;;
  *)
    echo "usage: $0 start|stop|status|auth-test"; exit 2 ;;
esac
