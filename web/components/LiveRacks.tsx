'use client';
import { useQuery, useSubscription, gql } from '@apollo/client';
import { useMemo } from 'react';
import { classifyGraphQLError } from '@/lib/graphqlErrors';
import { GRAPHQL_URL } from '@/lib/graphql';
import { RACK_UPDATED } from '@/lib/topologySubscriptions';
import GraphQLStatus from '@/components/GraphQLStatus';
import OptimizedImage from '@/components/OptimizedImage';

const RACKS_QUERY = gql`
  query Racks {
    racks {
      id
      name
      heightU
      siteId
      devices { id name model startU heightU }
    }
  }
`;

const mock = [
  {id:'RACK-01', name:'Row A / R01', heightU:42, siteId:'PAR-1', powerLoad:0.21, capacity:0.34, pue:1.18, temperature:38, status:'Active', devices:[] as any[]},
  {id:'RACK-05', name:'Row C / R05', heightU:42, siteId:'PAR-1', powerLoad:0.31, capacity:0.34, pue:1.41, temperature:67.4, status:'Hotspot', devices:[]},
];

export default function LiveRacks(){
  const { data, error, loading, refetch } = useQuery(RACKS_QUERY, {
    pollInterval: 30000,
    errorPolicy: 'all',
    fetchPolicy: 'no-cache',
    ssr: false
  });
  useSubscription(RACK_UPDATED, {
    onData: () => { void refetch(); }
  });

  const classified = useMemo(
    () => error ? classifyGraphQLError(error, GRAPHQL_URL) : null,
    [error]
  );

  const live = Boolean(data?.racks);
  const racks = live
    ? data.racks.map((r: any) => ({
        ...r,
        status: (r.devices?.length || 0) > 0 ? 'Active' : 'Empty',
        powerLoad: r.devices?.length || 0,
        capacity: r.heightU
      }))
    : mock;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-[16px]">Operations • Data Table</h3>
        <GraphQLStatus error={classified} loading={loading} live={live}/>
      </div>
      <div className="slds-card mt-3 overflow-hidden">
        <OptimizedImage src="/images/img-0.svg" alt="" width={1200} height={160} className="h-[160px] w-full object-cover" sizes="(max-width: 1440px) 100vw, 1440px" />
        <table className="w-full text-[12px]">
          <thead className="bg-[#FAFAF9] text-[11px] uppercase">
            <tr>
              <th className="p-2.5 text-left">Rack</th>
              <th className="p-2.5">Site</th>
              <th className="p-2.5">U</th>
              <th className="p-2.5">{live ? 'Devices' : 'Load'}</th>
              <th className="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {racks.map((r: any)=>(
              <tr key={r.id} className={r.status==='Hotspot'?'bg-[#FFF9E6]':''}>
                <td className="p-2.5 font-medium">{r.name || r.id}</td>
                <td className="p-2.5">{r.siteId || '—'}</td>
                <td className="p-2.5">{r.heightU || '—'}</td>
                <td className="p-2.5">{live ? r.powerLoad : `${r.powerLoad}/${r.capacity} MW`}</td>
                <td className="p-2.5"><span className="slds-badge bg-[#E6F8E9]">{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
