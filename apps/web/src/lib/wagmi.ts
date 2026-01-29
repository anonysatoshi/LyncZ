import { http, createConfig } from 'wagmi';
import { base } from 'wagmi/chains';

// RPC URL
const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org';

// Target chain ID
export const TARGET_CHAIN_ID = base.id; // 8453

// Create a basic wagmi config for Privy
// Privy manages connectors internally, we just need chains and transports
export const config = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(RPC_URL),
  },
  ssr: true,
});

// Export for compatibility
export const wagmiConfig = config;
