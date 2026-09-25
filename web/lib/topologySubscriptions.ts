import { gql } from '@apollo/client';

export const RACK_UPDATED = gql`
  subscription RackUpdated($rackId: ID) {
    rackUpdated(rackId: $rackId) {
      id
      name
      heightU
      siteId
      devices { id name model startU heightU }
    }
  }
`;

export const DEVICE_MOUNTED = gql`
  subscription DeviceMounted($rackId: ID) {
    deviceMounted(rackId: $rackId) {
      id
      name
      model
      startU
      heightU
    }
  }
`;
