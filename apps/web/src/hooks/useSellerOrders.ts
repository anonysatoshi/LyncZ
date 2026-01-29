'use client';

import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { api, Order } from '@/lib/api';

export function useSellerOrders() {
  const { address, isConnected: wagmiConnected } = useAccount();
  const { authenticated, ready } = usePrivy();
  // User is truly connected only if both wagmi AND Privy agree
  const isConnected = wagmiConnected && authenticated && ready;

  return useQuery<Order[]>({
    queryKey: ['orders', 'seller', address],
    queryFn: async () => {
      if (!address) return [];
      
      const response = await api.getOrdersBySeller(address);
      return response.orders;
    },
    enabled: isConnected && !!address, // Only fetch when truly connected
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 15000,
  });
}

