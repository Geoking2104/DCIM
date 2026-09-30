import { createServer } from 'node:http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/use/ws';
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  graphql,
} from 'graphql';

const DEVICES = [
  { id: 'dev-01', name: 'SRV-A', model: 'PowerEdge R650', startU: 1, heightU: 2 },
  { id: 'dev-02', name: 'SRV-B', model: 'PowerEdge R650', startU: 4, heightU: 2 },
];
const RACKS = [
  { id: 'RACK-01', name: 'Row A / R01', heightU: 42, siteId: 'PAR-1', devices: [DEVICES[0]] },
  { id: 'RACK-05', name: 'Row C / R05', heightU: 42, siteId: 'PAR-1', devices: [DEVICES[1]] },
];

const DeviceType = new GraphQLObjectType({
  name: 'Device',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    model: { type: GraphQLString },
    startU: { type: GraphQLInt },
    heightU: { type: GraphQLInt },
  }),
});

const RackType = new GraphQLObjectType({
  name: 'Rack',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    heightU: { type: new GraphQLNonNull(GraphQLInt) },
    siteId: { type: GraphQLString },
    devices: { type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(DeviceType))) },
  }),
});

const LifecycleType = new GraphQLObjectType({
  name: 'TopologyLifecycleEvent',
  fields: () => ({
    kind: { type: new GraphQLNonNull(GraphQLString) },
    at: { type: new GraphQLNonNull(GraphQLString) },
    rackId: { type: GraphQLID },
    deviceId: { type: GraphQLID },
    rack: { type: RackType },
    device: { type: DeviceType },
  }),
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    racks: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(RackType))),
      resolve: () => RACKS,
    },
    rack: {
      type: RackType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_src, args) => RACKS.find((rack) => rack.id === args.id) ?? null,
    },
  },
});

const SubscriptionType = new GraphQLObjectType({
  name: 'Subscription',
  fields: {
    topologyLifecycle: {
      type: new GraphQLNonNull(LifecycleType),
      args: { rackId: { type: GraphQLID } },
      subscribe: async function* (_src, args) {
        let n = 0;
        while (true) {
          n += 1;
          const flip = n % 2 === 1;
          yield {
            topologyLifecycle: {
              kind: flip ? 'RACK_UPDATED' : 'DEVICE_MOUNTED',
              at: new Date().toISOString(),
              rackId: args?.rackId ?? 'RACK-05',
              deviceId: flip ? null : 'dev-02',
              rack: RACKS[1],
              device: flip ? null : DEVICES[1],
            },
          };
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      },
    },
  },
});

const schema = new GraphQLSchema({ query: QueryType, subscription: SubscriptionType });

const httpServer = createServer(async (req, res) => {
  if (req.method === 'POST' && (req.url ?? '').startsWith('/graphql')) {
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const { query: source, variables, operationName } = JSON.parse(body);
      const result = await graphql({ schema, source, variableValues: variables, operationName });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result));
    } catch (error) {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ errors: [{ message: String(error) }] }));
    }
    return;
  }
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('mock-graphql up\n');
});

const wsServer = new WebSocketServer({ server: httpServer, path: '/graphql' });
useServer({ schema }, wsServer);

httpServer.listen(4000, () => {
  console.log('mock-graphql listening on :4000 (HTTP POST /graphql + WS /graphql)');
});
