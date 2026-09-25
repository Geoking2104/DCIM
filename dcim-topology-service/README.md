# DCIM Topology Service

NestJS GraphQL service for managing DCIM racks, devices, and their Neo4j topology relationships.

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

## Run locally

```bash
npm install
npm run start:dev
```

Open the GraphQL endpoint at <http://localhost:3000/graphql>.

## GraphQL operations

- `createRack` creates a rack node.
- `createDeviceAndMount` creates a device and links it to a rack with an `INSTALLED_IN` relationship.
- `rack` retrieves a rack and its installed devices.

## Build for production

```bash
npm run build
npm run start:prod
```
