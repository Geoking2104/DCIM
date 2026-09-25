# Multi-pod WebSocket deployment

This directory contains deployment examples for GraphQL subscriptions over the `graphql-ws` protocol. They support the current rack/device topology slice and are not a complete production or regulatory-compliance deployment.

## Kubernetes prerequisites

The manifests assume topology pods have the label `app: dcim-topology-service` and expose port `3000` through a Service named `dcim-topology-service`.

Create the Redis password as a Secret before applying the Redis manifest:

```bash
kubectl create secret generic dcim-redis-secret \
  --from-literal=password='replace-with-a-strong-password'
```

Apply the shared broker and an ingress option:

```bash
kubectl apply -f kubernetes/redis.yaml
kubectl apply -f kubernetes/ingress-nginx.yaml
```

Configure each topology pod with:

```text
REDIS_HOST=dcim-redis-service.default.svc.cluster.local
REDIS_PORT=6379
REDIS_PASSWORD=<value from dcim-redis-secret>
```

## NGINX Ingress

`kubernetes/ingress-nginx.yaml` enables cookie affinity and one-hour proxy timeouts. The ingress-nginx controller handles WebSocket upgrade headers when the upstream uses HTTP/1.1, so no configuration snippet is required.

## Envoy

`envoy/envoy.yaml` enables WebSocket upgrades and uses a generated `DCIM_ROUTE` cookie as the ring-hash key. Apply `kubernetes/topology-headless-service.yaml` so STRICT_DNS exposes individual pod addresses to Envoy; pointing Envoy at a normal ClusterIP would prevent Envoy from selecting a specific pod.

Sticky routing improves reconnect behavior, but Redis PubSub is what guarantees that events published by one topology pod reach subscribers connected to another.

## Platform security and evidence considerations

Before deploying tenant, CDU, energy, or regulatory data, add the controls defined in the [Technical Architecture](../../docs/technical-architecture.md) and [Functional Requirements](../../docs/functional-requirements.md):

- authenticate WebSocket handshakes and revalidate authorization for every subscription;
- include trusted server-derived tenant scope in events and prevent cross-tenant fan-out;
- use TLS, network policies, managed secrets, encrypted persistent storage and tested backups;
- keep audit/evidence records outside ephemeral pod filesystems;
- monitor event loss, lag, reconnects, authorization denials and data-quality gaps;
- ensure logs and traces do not expose tenant telemetry or regulatory evidence.

Ingress affinity is an availability aid, not a tenant-isolation or compliance control. The example Redis manifest and credentials must be replaced or hardened for production.
