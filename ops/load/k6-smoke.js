// Load smoke for the Qinode gateway: health + rack-read round-trips.
// First brick towards the NFR-PERF-001 target (p95 < 500 ms for topology
// reads, see docs/operations-readiness.md). Read-only: never mutates data.
//
// Usage: k6 run ops/load/k6-smoke.js
// Env:   BASE_URL (default http://127.0.0.1:8088), VUS (default 5),
//        DURATION (default 30s)

import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:8088';
const VUS = Number(__ENV.VUS || 5);
const DURATION = __ENV.DURATION || '30s';

export const options = {
  scenarios: {
    smoke: { executor: 'constant-vus', vus: VUS, duration: DURATION },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    'http_req_duration{name:graphql}': ['p(95)<500'],
  },
};

export default function () {
  const health = http.get(`${BASE}/health/live`, { tags: { name: 'health' } });
  check(health, { 'health/live is 200': (r) => r.status === 200 });

  const res = http.post(
    `${BASE}/graphql`,
    JSON.stringify({ query: '{ racks { id name heightU siteId } }' }),
    { headers: { 'content-type': 'application/json' }, tags: { name: 'graphql' } }
  );
  check(res, {
    'graphql is 200': (r) => r.status === 200,
    'graphql returns data.racks': (r) => {
      try {
        return Array.isArray(r.json('data.racks'));
      } catch (e) {
        return false;
      }
    },
  });
}
