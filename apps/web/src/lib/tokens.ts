/**
 * Token utilities for multi-token support
 * Chain-aware configuration - uses NEXT_PUBLIC_CHAIN_ID to determine active tokens
 */

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
}

// Chain IDs
const CHAIN_IDS = {
  BASE_MAINNET: 8453,
  BSC_MAINNET: 56,
} as const;

// Token configurations per chain
const CHAIN_TOKENS: Record<number, Record<string, TokenInfo>> = {
  // Base Mainnet
  [CHAIN_IDS.BASE_MAINNET]: {
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    '0x4200000000000000000000000000000000000006': {
      symbol: 'WETH',
      name: 'Wrapped ETH',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000006',
    },
    '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': {
      symbol: 'cbBTC',
      name: 'Coinbase Wrapped BTC',
      decimals: 8,
      address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    },
  },
  // BSC Mainnet (for future USDT support)
  [CHAIN_IDS.BSC_MAINNET]: {
    '0x55d398326f99059ff775485246999027b3197955': {
      symbol: 'USDT',
      name: 'Tether USD',
      decimals: 18,
      address: '0x55d398326f99059fF775485246999027B3197955',
    },
    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d': {
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 18,
      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    },
  },
};

/**
 * Get current chain ID from environment
 */
function getChainId(): number {
  const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;
  return chainId ? parseInt(chainId) : CHAIN_IDS.BASE_MAINNET;
}

/**
 * Get tokens for the current chain
 */
function getChainTokens(): Record<string, TokenInfo> {
  const chainId = getChainId();
  return CHAIN_TOKENS[chainId] || CHAIN_TOKENS[CHAIN_IDS.BASE_MAINNET];
}

/**
 * List of supported token addresses for current chain
 */
export const SUPPORTED_TOKENS = Object.values(getChainTokens()).map(t => t.address);

/**
 * Get the default/primary token for the current chain (first in list)
 */
export function getDefaultToken(): TokenInfo {
  const tokens = getChainTokens();
  const firstKey = Object.keys(tokens)[0];
  return tokens[firstKey];
}

/**
 * Get default token address (useful for fallbacks)
 */
export function getDefaultTokenAddress(): string {
  return getDefaultToken().address;
}

/**
 * Get token info by address (case-insensitive)
 */
export function getTokenInfo(address: string): TokenInfo {
  const normalized = address.toLowerCase();
  const tokens = getChainTokens();
  const token = tokens[normalized];
  
  if (token) {
    return token;
  }
  
  // Unknown token - return generic info
  return {
    symbol: 'TOKEN',
    name: 'Unknown Token',
    decimals: 18, // Default to 18 decimals (ERC20 standard)
    address: address,
  };
}

/**
 * Get token symbol by address
 */
export function getTokenSymbol(address: string): string {
  return getTokenInfo(address).symbol;
}

/**
 * Get token decimals by address
 */
export function getTokenDecimals(address: string): number {
  return getTokenInfo(address).decimals;
}

/**
 * Format token amount with correct decimals (for display - standard rounding)
 */
export function formatTokenAmount(amount: string, tokenAddress: string): string {
  const decimals = getTokenDecimals(tokenAddress);
  const num = parseInt(amount) / Math.pow(10, decimals);
  
  // Display format based on token decimals
  // 6 decimals (USDC/USDT): show 2 decimal places
  // 8 decimals (BTC): show 6 decimal places
  // 18 decimals (ETH/ERC20): show 4 decimal places
  let displayDecimals = 2;
  if (decimals === 8) {
    displayDecimals = 6;
  } else if (decimals === 18) {
    displayDecimals = 4;
  }
  
  return num.toFixed(displayDecimals);
}

/**
 * Format token amount rounded DOWN (for "Remaining" display - conservative)
 * Prevents showing more than available, e.g., 1.495 → 1.49 not 1.50
 */
export function formatTokenAmountFloor(amount: string, tokenAddress: string): string {
  const decimals = getTokenDecimals(tokenAddress);
  const num = parseInt(amount) / Math.pow(10, decimals);
  
  // Display decimals based on token
  let displayDecimals = 2;
  if (decimals === 8) {
    displayDecimals = 6;
  } else if (decimals === 18) {
    displayDecimals = 4;
  }
  
  // Round DOWN using floor
  const multiplier = Math.pow(10, displayDecimals);
  const floored = Math.floor(num * multiplier) / multiplier;
  
  return floored.toFixed(displayDecimals);
}

/**
 * Get exact token amount without display rounding (for Max button / transactions)
 * Uses full precision to avoid "insufficient funds" errors from rounding up
 */
export function getExactTokenAmount(amount: string, tokenAddress: string): string {
  const decimals = getTokenDecimals(tokenAddress);
  const num = parseInt(amount) / Math.pow(10, decimals);
  
  // Return with full precision up to token's decimals
  // This ensures we never try to withdraw more than available
  return num.toFixed(decimals);
}

/**
 * Format token amount with symbol
 */
export function formatTokenAmountWithSymbol(amount: string, tokenAddress: string): string {
  const formatted = formatTokenAmount(amount, tokenAddress);
  const symbol = getTokenSymbol(tokenAddress);
  return `${formatted} ${symbol}`;
}

/**
 * Format token amount rounded DOWN with symbol (for "Available/Remaining" display - conservative)
 * Prevents showing more than available, e.g., 2.495 → "2.49 USDC" not "2.50 USDC"
 */
export function formatTokenAmountFloorWithSymbol(amount: string, tokenAddress: string): string {
  const formatted = formatTokenAmountFloor(amount, tokenAddress);
  const symbol = getTokenSymbol(tokenAddress);
  return `${formatted} ${symbol}`;
}

/**
 * Get exchange rate label for a token
 */
export function getExchangeRateLabel(tokenAddress: string): string {
  const symbol = getTokenSymbol(tokenAddress);
  return `CNY/${symbol}`;
}

// ============ Flat Fee Constants (must match SimpleFeeCalculator.sol) ============

/**
 * Flat fee in USDC units (6 decimals)
 * Public orders: 0.2 USDC = 200000
 * Private orders: 0.4 USDC = 400000
 */
const PUBLIC_FEE_USDC = BigInt(200000);  // 0.2 USDC
const PRIVATE_FEE_USDC = BigInt(400000); // 0.4 USDC

/**
 * Hardcoded token prices in USDC (no oracle)
 * Must match SimpleFeeCalculator.sol constants
 */
const ETH_PRICE_USDC = BigInt(3000);    // 1 ETH = 3000 USDC
const BTC_PRICE_USDC = BigInt(100000);  // 1 BTC = 100000 USDC

// Token addresses (Base Mainnet) - must match SimpleFeeCalculator.sol
const USDC_ADDRESS = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
const WETH_ADDRESS = '0x4200000000000000000000000000000000000006';
const CBBTC_ADDRESS = '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf';

/**
 * Get flat fee for a trade in token units
 * @param tokenAddress Token address
 * @param isPublic Whether order is public (0.2 USDC) or private (0.4 USDC)
 * @returns Fee amount in token's smallest unit (wei/satoshi/etc.)
 */
export function getFlatFee(tokenAddress: string, isPublic: boolean): bigint {
  const normalized = tokenAddress.toLowerCase();
  const feeUsdc = isPublic ? PUBLIC_FEE_USDC : PRIVATE_FEE_USDC;
  
  if (normalized === USDC_ADDRESS) {
    // USDC: fee is already in correct units (6 decimals)
    return feeUsdc;
  } else if (normalized === WETH_ADDRESS) {
    // WETH: Convert USDC to ETH
    // fee_wei = feeUsdc * 10^12 / ETH_PRICE_USDC
    return (feeUsdc * BigInt(1000000000000)) / ETH_PRICE_USDC;
  } else if (normalized === CBBTC_ADDRESS) {
    // cbBTC: Convert USDC to BTC
    // fee_satoshi = feeUsdc * 100 / BTC_PRICE_USDC
    return (feeUsdc * BigInt(100)) / BTC_PRICE_USDC;
  }
  
  // Unsupported token - return 0 (fail-safe)
  return BigInt(0);
}

/**
 * Get flat fee in human-readable format (for display)
 * @param tokenAddress Token address
 * @param isPublic Whether order is public or private
 * @returns Human-readable fee amount (e.g., "0.02" for USDC)
 */
export function getFlatFeeDisplay(tokenAddress: string, isPublic: boolean): string {
  const fee = getFlatFee(tokenAddress, isPublic);
  const decimals = getTokenDecimals(tokenAddress);
  const displayAmount = Number(fee) / Math.pow(10, decimals);
  
  // Use appropriate decimal places based on token
  if (decimals === 6) return displayAmount.toFixed(2);   // USDC: 0.02
  if (decimals === 8) return displayAmount.toFixed(8);   // BTC: very small
  if (decimals === 18) return displayAmount.toFixed(8);  // ETH: very small
  return displayAmount.toFixed(4);
}

/**
 * Format flat fee with symbol (e.g., "0.4 USDC")
 */
export function formatFlatFeeDisplay(tokenAddress: string, isPublic: boolean): string {
  const feeDisplay = getFlatFeeDisplay(tokenAddress, isPublic);
  const symbol = getTokenSymbol(tokenAddress);
  return `${feeDisplay} ${symbol}`;
}

/**
 * Get flat fee in USDC equivalent (for display purposes)
 * @param isPublic Whether order is public or private
 * @returns Fee in USDC (e.g., "0.02")
 */
export function getFlatFeeUsdcDisplay(isPublic: boolean): string {
  const fee = isPublic ? PUBLIC_FEE_USDC : PRIVATE_FEE_USDC;
  return (Number(fee) / 1000000).toFixed(2);
}

/**
 * Get fee display with USDC equivalent for non-USDC tokens
 * @param tokenAddress Token address
 * @param isPublic Whether order is public or private
 * @returns Object with fee display info
 */
export function getFeeDisplayWithEquivalent(tokenAddress: string, isPublic: boolean): {
  feeAmount: string;
  feeSymbol: string;
  usdcEquivalent: string;
  isUsdc: boolean;
} {
  const normalized = tokenAddress.toLowerCase();
  const isUsdc = normalized === USDC_ADDRESS;
  const usdcEquivalent = getFlatFeeUsdcDisplay(isPublic);
  
  if (isUsdc) {
    return {
      feeAmount: usdcEquivalent,
      feeSymbol: 'USDC',
      usdcEquivalent,
      isUsdc: true,
    };
  }
  
  // For non-USDC tokens, show token amount with USDC equivalent
  const feeAmount = getFlatFeeDisplay(tokenAddress, isPublic);
  const feeSymbol = getTokenSymbol(tokenAddress);
  
  return {
    feeAmount,
    feeSymbol,
    usdcEquivalent,
    isUsdc: false,
  };
}
