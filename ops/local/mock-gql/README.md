# Mock GraphQL (bac à sable web)

Serveur GraphQL minimal (HTTP + subscriptions `graphql-ws`) pour tester l'UI sans la
pile complète : schéma `Rack` / `Device` / `TopologyLifecycleEvent`, requête `racks`,
subscription `topologyLifecycle` émettant un événement toutes les 2,5 s.

```bash
cd ops/local/mock-gql
npm install
node server.mjs        # écoute sur :4000 (HTTP POST /graphql + WS /graphql)
```

Côté web : reconstruire avec `NEXT_PUBLIC_GRAPHQL_URL=http://127.0.0.1:4000/graphql` et
`NEXT_PUBLIC_GRAPHQL_WS_URL=ws://127.0.0.1:4000/graphql`, puis démarrer le web —
la page topologie affiche les racks du mock et reçoit les événements en direct.
