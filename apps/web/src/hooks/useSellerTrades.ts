import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { api, Trade } from '@/lib/api';

export function useSellerTrades() {
  const { address } = useAccount();

  return useQuery<Trade[]>({
    queryKey: ['trades', 'seller', address],
    queryFn: async () => {
      if (!address) return [];
      
      const response = await api.getTradesBySeller(address);
      return response.trades;
    },
    enabled: !!address, // Only fetch when wallet connected
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 15000,
  });
}

