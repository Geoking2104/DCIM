# Multi-pod WebSocket deployment

This directory contains deployment examples for GraphQL subscriptions over the `graphql-ws` protocol.

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
