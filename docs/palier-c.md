# Palier C — GraphQL Rust

`POST http://127.0.0.1:8088/graphql`

Store mémoire (pas encore Neo4j). Nest reste la source de vérité prod jusqu’au flag `GRAPHQL_UPSTREAM=rust`.

```graphql
mutation {
  createRack(input: { name: "RACK-05", heightU: 42, siteId: "site-paris-01" }) {
    id name heightU
  }
}

mutation {
  createDeviceAndMount(input: {
    name: "SRV-01", model: "R760", startU: 10, heightU: 2, rackId: "…"
  }) { id startU }
}

mutation {
  moveDevice(input: { deviceId: "…", rackId: "…", startU: 20 }) { id startU rackId }
}
```

async-graphql expose `heightU` / `startU` (camelCase) malgré les champs Rust `height_u`.
