// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFeeCalculator
 * @notice Interface for calculating trade fees
 * @dev Allows upgradeable fee logic without modifying the main escrow contract
 *      
 *      Current implementation uses flat-rate fees:
 *      - Public orders: 0.02 USDC
 *      - Private orders: 0.01 USDC
 *      
 *      Fees are converted to token units using hardcoded USDC prices.
 */
interface IFeeCalculator {
    /**
     * @notice Calculate fee for a trade
     * @param tokenAmount Amount of tokens being traded (may be unused in flat-fee model)
     * @param fiatAmount Amount of fiat in cents (may be unused in flat-fee model)
     * @param token Token address - used to return fee in correct token units
     * @param buyer Buyer address (for user-specific discounts if applicable)
     * @param isPublic Whether the order is public (may have different fee rate)
     * @return feeTokens Fee amount in token units
     */
    function calculateFee(
        uint256 tokenAmount,
        uint256 fiatAmount,
        address token,
        address buyer,
        bool isPublic
    ) external view returns (uint256 feeTokens);
    
    /**
     * @notice Get flat fee for public orders in USDC units (6 decimals)
     * @return Flat fee amount (e.g., 20000 = 0.02 USDC)
     * @dev In the current flat-rate model, this returns USDC units, not basis points
     */
    function getFeeRate() external view returns (uint256);
    
    /**
     * @notice Get flat fee for private orders in USDC units (6 decimals)
     * @return Flat fee amount (e.g., 10000 = 0.01 USDC)
     * @dev In the current flat-rate model, this returns USDC units, not basis points
     */
    function getPrivateFeeRate() external view returns (uint256);
}
