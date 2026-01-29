'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';

export function useBuyerTrades() {
  const { address, isConnected: wagmiConnected } = useAccount();
  const { authenticated, ready } = usePrivy();
  // User is truly connected only if both wagmi AND Privy agree
  const isConnected = wagmiConnected && authenticated && ready;

  return useQuery({
    queryKey: ['buyer-trades', address],
    queryFn: () => {
      if (!address) throw new Error('No address');
      return api.getTradesByBuyer(address);
    },
    enabled: isConnected && !!address,
    refetchInterval: 30000, // Auto-refresh every 30 seconds (reduces server load)
    staleTime: 15000,
  });
}

