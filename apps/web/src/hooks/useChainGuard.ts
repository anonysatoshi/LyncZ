'use client';

import { useAccount, useSwitchChain } from 'wagmi';
import { base } from 'wagmi/chains';
import { useCallback } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export const TARGET_CHAIN_ID = base.id; // 8453

/**
 * Hook to guard against wrong chain connections.
 * Returns chain state and helpers for UI components.
 * 
 * Checks BOTH wagmi's connection state AND Privy's authentication state
 * to ensure proper disconnect behavior.
 */
export function useChainGuard() {
  const { address, isConnected: wagmiConnected, chainId } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const { authenticated, ready } = usePrivy();
  
  // User is truly connected only if both wagmi AND Privy say so
  const isConnected = wagmiConnected && authenticated && ready;
  
  const isCorrectChain = isConnected && chainId === TARGET_CHAIN_ID;
  const isWrongChain = isConnected && chainId !== undefined && chainId !== TARGET_CHAIN_ID;
  const canInteract = isConnected && isCorrectChain;
  
  // Get chain name
  const getChainName = (id: number | undefined) => {
    const names: Record<number, string> = {
      1: 'Ethereum',
      5: 'Goerli',
      11155111: 'Sepolia',
      8453: 'Base',
      84531: 'Base Goerli',
      84532: 'Base Sepolia',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
    };
    return id ? names[id] || `Chain ${id}` : 'Unknown';
  };
  
  const currentChainName = getChainName(chainId);
  const targetChainName = getChainName(TARGET_CHAIN_ID);
  
  const switchToBase = useCallback(() => {
    if (switchChain) {
      switchChain({ chainId: TARGET_CHAIN_ID });
    }
  }, [switchChain]);
  
  return {
    address,
    isConnected,
    chainId,
    isCorrectChain,
    isWrongChain,
    canInteract,
    currentChainName,
    targetChainName,
    switchToBase,
    isSwitching,
  };
}
