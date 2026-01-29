import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { api, Trade } from '@/lib/api';

/**
 * Fetches all trades for the current user (both as buyer AND seller)
 * and deduplicates them.
 */
export function useUserTrades() {
  const { address } = useAccount();

  return useQuery<Trade[]>({
    queryKey: ['trades', 'user', address],
    queryFn: async () => {
      if (!address) return [];
      
      // Fetch both buyer trades and seller trades in parallel
      const [buyerResponse, sellerResponse] = await Promise.all([
        api.getTradesByBuyer(address),
        api.getTradesBySeller(address),
      ]);
      
      // Combine and deduplicate by trade_id
      const allTrades = [...buyerResponse.trades, ...sellerResponse.trades];
      const uniqueTrades = Array.from(
        new Map(allTrades.map(t => [t.trade_id, t])).values()
      );
      
      // Sort by created_at descending
      uniqueTrades.sort((a, b) => b.created_at - a.created_at);
      
      return uniqueTrades;
    },
    enabled: !!address,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 15000,
  });
}

