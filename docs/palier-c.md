# Palier C — GraphQL Rust + bascule Next

## Bascule

```
GRAPHQL_UPSTREAM=nest   # défaut, Neo4j + Keycloak
GRAPHQL_UPSTREAM=rust   # gateway Rust :8088/graphql, stockage Neo4j
```

Le proxy `web/app/api/graphql` utilise uniquement la cible configurée en mode live et expose la cible dans `x-graphql-upstream`. Il ne bascule plus silencieusement vers un autre service.

## Rust

```bash
NEO4J_URI=bolt://localhost:7687 \
NEO4J_USER=neo4j \
NEO4J_PASSWORD=change-me \
  cargo run -p qinode-gateway
curl -s localhost:8088/graphql -H 'content-type: application/json' \
  -d '{"query":"mutation { createRack(input:{name:\"RACK-05\",heightU:42,siteId:\"paris\"}){id name}}"}'
```

Mêmes noms de champs camelCase que Nest. Les racks, devices et relations `MOUNTED_IN` sont persistés dans Neo4j. Le gateway vérifie la connexion et crée les contraintes d'unicité au démarrage.

## Suite

1. Autorisation RBAC/ABAC et isolation tenant sur chaque resolver
2. Subscriptions multi-pod via un bus durable
3. Période de lecture parallèle Nest/Rust avant retrait de Nest
