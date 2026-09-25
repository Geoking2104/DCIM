# DCIM Topology Service

NestJS GraphQL service for managing DCIM racks, devices, and their Neo4j topology relationships. It is the first implemented slice of the wider graph-first platform described in the [Functional Requirements](../docs/functional-requirements.md) and [Technical Architecture](../docs/technical-architecture.md).

## Current scope

This service currently implements rack and device topology plus real-time update events. CDU loops, meters, tenants, regulatory evidence, PUE/WUE calculations, labels, heat reuse, and CSRD/ESRS exports are target requirements and are **not yet implemented** by this service.

Future topology types must retain effective dates and provenance so historical reporting snapshots remain reproducible. Tenant-scoped types and subscriptions must enforce authorization before they are exposed; filtering a shared event stream by client-supplied `tenantId` is not an authorization control.

## Requirements

- Node.js 20 or later
- npm
- Neo4j 5.x

The repository's root `docker-compose.yml` provides a compatible local Neo4j instance.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | HTTP and GraphQL service port |
| `NEO4J_URI` | `bolt://localhost:7687` | Neo4j Bolt endpoint |
| `NEO4J_USERNAME` | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | `dcim_secure_password` | Neo4j password |
| `NEO4J_DATABASE` | `neo4j` | Neo4j database name |
| `REDIS_HOST` | _unset_ | Redis host; when unset, the service uses in-memory PubSub |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | _unset_ | Redis password |

## Run locally

```bash
npm install
npm run start:dev
```

Open the GraphQL endpoint at <http://localhost:3000/graphql>.

## GraphQL operations

- `createRack` creates a rack node and publishes `rackUpdated`.
- `createDeviceAndMount` creates a device, links it to a rack with an `INSTALLED_IN` relationship, and publishes `deviceMounted` and `rackUpdated`.
- `rack` retrieves a rack and its installed devices.

### Real-time subscriptions

The service exposes subscriptions over the modern `graphql-ws` protocol. Both subscriptions accept an optional `rackId` so clients can receive updates for one rack or omit it to receive all updates.

```graphql
subscription OnRackUpdated($rackId: ID) {
  rackUpdated(rackId: $rackId) {
    id
    name
    heightU
    devices {
      id
      name
      model
      startU
      heightU
    }
  }
}
```

```graphql
subscription OnDeviceMounted($rackId: ID) {
  deviceMounted(rackId: $rackId) {
    id
    name
    model
    startU
    heightU
  }
}
```

The default broker is in-memory and is suitable for local development or a single service instance. Setting `REDIS_HOST` switches the service to Redis-backed PubSub so events are shared across replicas. See [`deploy/README.md`](deploy/README.md) for Kubernetes, NGINX Ingress, and Envoy configuration.

## Build for production

```bash
npm run build
npm run start:prod
```

Production readiness also requires OIDC authentication, tenant/asset authorization, managed secrets, TLS, audit logging, backups, and the controls listed in the platform architecture. The default password and in-memory PubSub mode are development conveniences only.
