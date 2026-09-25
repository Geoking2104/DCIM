'use client';
import { ClassifiedGraphQLError } from '@/lib/graphqlErrors';

export default function GraphQLStatus({
  error,
  loading,
  live
}: {
  error?: ClassifiedGraphQLError | null;
  loading?: boolean;
  live?: boolean;
}) {
  if (live) {
    return <span className="slds-badge bg-[#E6F8E9] text-[#0B7E25]">GraphQL LIVE</span>;
  }
  if (loading && !error) {
    return <span className="slds-badge bg-[#E6F2FE] text-[#0176D3]">GraphQL …</span>;
  }
  if (!error) {
    return <span className="slds-badge bg-[#FFF0C2] text-[#7A4E00]">MOCK</span>;
  }
  const color =
    error.kind === 'validation' ? 'bg-[#FFF0C2] text-[#7A4E00]' :
    error.kind === 'not_found' ? 'bg-[#E6F2FE] text-[#0176D3]' :
    'bg-[#FFF0F0] text-[#C23934]';
  return <span className={`slds-badge ${color}`}>{error.kind.toUpperCase()}</span>;
}
