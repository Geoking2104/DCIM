# Mutations GraphQL (Nest topology)

Rôles Keycloak : `qinode-ops` / `qinode-admin`. `deleteRack` : admin seulement.

```graphql
mutation {
  createRack(input: { name: "RACK-05", heightU: 42, siteId: "site-paris-01" }) { id name }
}

mutation {
  updateRack(input: { id: "...", name: "RACK-05A" }) { id name heightU }
}

mutation {
  createDeviceAndMount(input: {
    name: "SRV-01", model: "Dell R760", startU: 10, heightU: 2, rackId: "..."
  }) { id startU }
}

mutation {
  updateDevice(input: { id: "...", startU: 12 }) { id startU }
}

mutation {
  moveDevice(input: { deviceId: "...", rackId: "...", startU: 20 }) { id startU }
}

mutation { unmountDevice(id: "...") }
mutation { deleteRack(id: "...") }
```

Chaque écriture publie `rackUpdated` / `deviceMounted` (Redis pubsub).
