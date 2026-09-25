# Palier C — GraphQL Rust + bascule Next

## Bascule

```
GRAPHQL_UPSTREAM=nest   # défaut, Neo4j + Keycloak
GRAPHQL_UPSTREAM=rust   # sidecar :8088/graphql (mémoire)
```

Le proxy `web/app/api/graphql` essaie la cible puis l’autre (header `x-graphql-upstream`).

## Rust

```bash
cargo run -p qinode-gateway
curl -s localhost:8088/graphql -H 'content-type: application/json' \
  -d '{"query":"mutation { createRack(input:{name:\"RACK-05\",heightU:42,siteId:\"paris\"}){id name}}"}'
```

Mêmes noms de champs camelCase que Nest. Store mémoire : redémarrage = vide.

## Suite

1. `neo4rs` à la place du HashMap
2. JWKS sur `/graphql` Rust
3. Subscriptions `rackUpdated` (graphql-ws)
