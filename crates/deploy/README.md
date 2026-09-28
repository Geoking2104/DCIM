# Qinode gateway deployment

`kubernetes/qinode-gateway.yaml` provides a two-replica baseline with rolling updates, liveness/readiness probes, a disruption budget, resource limits, a read-only filesystem, and a non-root security context.

Before applying it:

1. Publish the gateway image and replace `qinode-gateway:0.1.0` with an immutable digest.
2. Replace the example Keycloak issuer and review the Neo4j and ClickHouse service names.
3. Provision the `qinode-gateway-secrets` Secret with the `neo4j-password` key through the cluster secret manager. Do not commit the Secret manifest.
4. Terminate TLS at the ingress or service mesh and restrict network access to the web/API namespaces and the required data services.
5. Confirm `/health/ready` returns HTTP 200 before directing traffic to the deployment.

The manifest does not deploy Neo4j, ClickHouse, Keycloak, certificates, or an ingress. Those stateful and security-sensitive components require environment-specific operators or managed services.
