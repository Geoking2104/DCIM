import { gql } from '@apollo/client';

export const POWER_CHAIN_QUERY = gql`
  query PowerChain($rackId: String) {
    powerChain(rackId: $rackId) {
      grid { power_kw voltage status source }
      generator { power_kw status fuel_level }
      ups { id power_kw load_pct battery_runtime status cells { id temp voltage soc } }
      pdus { id power_kw load_pct status }
      rack { id power_kw pue }
      devices { id name power_kw }
    }
  }
`;

export const POWER_CHAIN_SUB = gql`
  subscription OnPowerUpdate {
    powerUpdated {
      ups { power_kw load_pct }
      pdus { id power_kw }
      rack { id power_kw }
      battery { cell_id temp }
    }
  }
`;
