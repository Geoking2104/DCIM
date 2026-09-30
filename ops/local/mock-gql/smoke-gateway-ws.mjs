// Smoke : subscription WebSocket du gateway Rust (/graphql/ws).
// Souscrit à `rackUpdated`, déclenche un createRack via HTTP, vérifie l'événement.
// Exécution (depuis ops/local/mock-gql, qui fournit graphql-ws + ws) :
//   cd ops/local/mock-gql && npm install && node ../smoke-gateway-ws.mjs
// Surcharges : WS_URL, HTTP_URL.
import { createClient } from 'graphql-ws';
import WebSocket from 'ws';

const url = process.env.WS_URL || 'ws://127.0.0.1:8088/graphql/ws';
const http = process.env.HTTP_URL || 'http://127.0.0.1:8088/graphql';

const client = createClient({ url, webSocketImpl: WebSocket, lazy: false });

let done = false;
let timer;

const fail = (reason) => {
  console.log('FAIL:', reason);
  process.exit(2);
};

const unsubscribe = client.subscribe(
  { query: 'subscription { rackUpdated { id name heightU siteId } }' },
  {
    next: (data) => {
      if (done) return;
      done = true;
      console.log('EVENT:', JSON.stringify(data));
      clearTimeout(timer);
      unsubscribe();
      console.log('smoke-gateway-ws OK');
      process.exit(0);
    },
    error: (e) => fail('subscription error: ' + JSON.stringify(e)),
  },
);

timer = setTimeout(() => fail('timeout — aucun événement reçu en 15 s'), 15000);

// Déclenche un événement après connexion.
setTimeout(async () => {
  try {
    const res = await fetch(http, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        query:
          'mutation { createRack(input: {name: "WS-SMOKE-RACK", heightU: 42, siteId: "ci"}) { id name } }',
      }),
    });
    console.log('mutation sent:', (await res.text()).slice(0, 140));
  } catch (e) {
    fail('mutation request failed: ' + e.message);
  }
}, 1500);
