import { gql } from '@apollo/client';

export const RACK_UPDATED = gql`
  subscription RackUpdated($rackId: ID) {
    rackUpdated(rackId: $rackId) {
      id name heightU siteId
      devices { id name model startU heightU }
    }
  }
`;

export const DEVICE_MOUNTED = gql`
  subscription DeviceMounted($rackId: ID) {
    deviceMounted(rackId: $rackId) { id name model startU heightU }
  }
`;

export const TOPOLOGY_LIFECYCLE = gql`
  subscription TopologyLifecycle($rackId: ID) {
    topologyLifecycle(rackId: $rackId) {
      kind
      at
      rackId
      deviceId
      rack { id name heightU siteId devices { id name } }
      device { id name model startU heightU }
    }
  }
`;
