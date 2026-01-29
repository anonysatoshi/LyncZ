-- ============================================================================
-- LyncZ Database Schema
-- Version: 6.0 (v4 Privacy: accountLinesHash on-chain, plain text in DB only)
-- Date: 2026-01-27
-- Purpose: Complete database schema for LyncZ escrow
-- ============================================================================
--
-- Privacy Design:
--   - On-chain: Only accountLinesHash stored (seller info is private)
--   - Database: Plain text accountId/accountName stored for buyer display
--   - Backend verifies: computed hash matches on-chain hash
--   - txIdHash: Transaction ID never appears on-chain, only its hash
--
-- ============================================================================

-- ============================================================================
-- ORDERS TABLE
-- ============================================================================
-- On-chain struct Order in LyncZEscrow.sol (v4):
--   bytes32 orderId;
--   address seller;
--   address token;
--   uint256 totalAmount;
--   uint256 remainingAmount;
--   uint256 exchangeRate;
--   PaymentRail rail;
--   bytes32 accountLinesHash;    // SHA256(20 || name || 21 || id) - NOT plain text
--   bool isPublic;               // Public or private listing
--   uint256 createdAt;
--   uint8 tokenDecimals;

CREATE TABLE IF NOT EXISTS orders (
    -- On-chain fields
    "orderId" VARCHAR(66) PRIMARY KEY,                    -- bytes32 as hex string with 0x prefix
    "seller" VARCHAR(42) NOT NULL,                        -- address
    "token" VARCHAR(42) NOT NULL,                         -- address (USDC, USDT, etc.)
    "totalAmount" NUMERIC(78,0) NOT NULL,                 -- uint256
    "remainingAmount" NUMERIC(78,0) NOT NULL,             -- uint256 (determines if order is active)
    "exchangeRate" NUMERIC(78,0) NOT NULL,                -- uint256 (CNY cents per token unit)
    "rail" INTEGER NOT NULL DEFAULT 0,                    -- PaymentRail: 0=ALIPAY, 1=WECHAT
    "createdAt" BIGINT NOT NULL,                          -- uint256 (unix timestamp)
    "isPublic" BOOLEAN NOT NULL DEFAULT true,             -- On-chain: public or private order
    
    -- Off-chain fields (plain text for buyer display - NOT on-chain)
    "accountId" TEXT NOT NULL,                            -- Payment account ID (Alipay/WeChat)
    "accountName" TEXT NOT NULL,                          -- Payment account holder name
    "privateCode" VARCHAR(6),                             -- 6-digit code for private orders
    "syncedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT "orders_remainingAmount_lte_totalAmount" CHECK ("remainingAmount" <= "totalAmount"),
    CONSTRAINT "orders_rail_valid" CHECK ("rail" IN (0, 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_orders_seller" ON orders("seller");
CREATE INDEX IF NOT EXISTS "idx_orders_token" ON orders("token");
CREATE INDEX IF NOT EXISTS "idx_orders_rail" ON orders("rail");
CREATE INDEX IF NOT EXISTS "idx_orders_remainingAmount" ON orders("remainingAmount");
CREATE INDEX IF NOT EXISTS "idx_orders_createdAt" ON orders("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_orders_token_remainingAmount" ON orders("token", "remainingAmount");
CREATE INDEX IF NOT EXISTS "idx_orders_rail_remainingAmount" ON orders("rail", "remainingAmount");
CREATE INDEX IF NOT EXISTS "idx_orders_isPublic" ON orders("isPublic") WHERE "isPublic" = true;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_orders_privateCode" ON orders("privateCode") WHERE "privateCode" IS NOT NULL;

-- ============================================================================
-- TRADES TABLE
-- ============================================================================
-- On-chain struct Trade in LyncZEscrow.sol:
--   bytes32 tradeId;
--   bytes32 orderId;
--   address buyer;
--   uint256 tokenAmount;
--   uint256 fiatAmount;
--   uint256 createdAt;
--   uint256 expiresAt;
--   TradeStatus status;
--
-- Privacy notes:
--   - transactionId stored in DB (for display), but only txIdHash sent to chain
--   - paymentTime stored in DB and sent to chain (not privacy-sensitive)

CREATE TABLE IF NOT EXISTS trades (
    -- On-chain fields
    "tradeId" VARCHAR(66) PRIMARY KEY,                    -- bytes32 as hex string with 0x prefix
    "orderId" VARCHAR(66) NOT NULL,                       -- bytes32 reference to order
    "buyer" VARCHAR(42) NOT NULL,                         -- address
    "token" VARCHAR(42),                                  -- address (denormalized from order)
    "tokenAmount" NUMERIC(78,0) NOT NULL,                 -- uint256
    "cnyAmount" NUMERIC(78,0) NOT NULL,                   -- uint256 (fiatAmount in cents)
    "feeAmount" NUMERIC(78,0),                            -- uint256 (fee from TradeCreated event)
    "rail" INTEGER NOT NULL DEFAULT 0,                    -- PaymentRail: 0=ALIPAY, 1=WECHAT
    "createdAt" BIGINT NOT NULL,                          -- uint256 (unix timestamp)
    "expiresAt" BIGINT NOT NULL,                          -- uint256 (unix timestamp)
    "status" INTEGER NOT NULL,                            -- TradeStatus: 0=PENDING, 1=SETTLED, 2=EXPIRED
    
    -- Payment receipt fields (from PDF)
    "transactionId" TEXT,                                 -- Alipay transaction ID (stored for display)
    "paymentTime" TEXT,                                   -- Payment timestamp (YYYY-MM-DD HH:MM:SS)
    
    -- Off-chain fields
    "syncedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "escrowTxHash" VARCHAR(66),                           -- Transaction hash when trade created
    "settlementTxHash" VARCHAR(66),                       -- Transaction hash when settled
    
    -- PDF storage
    "pdf_file" BYTEA,                                     -- Binary PDF data
    "pdf_filename" TEXT,                                  -- Original filename
    "pdf_uploaded_at" TIMESTAMPTZ,                        -- When PDF was uploaded
    
    -- Axiom proof storage
    "proof_user_public_values" BYTEA,                     -- User public values (32 bytes)
    "proof_accumulator" BYTEA,                            -- Halo2 accumulator (384 bytes)
    "proof_data" BYTEA,                                   -- Halo2 proof data (1376 bytes)
    "axiom_proof_id" VARCHAR(100),                        -- Axiom API proof ID
    "proof_generated_at" TIMESTAMPTZ,                     -- When proof was generated
    "proof_json" TEXT,                                    -- Full proof JSON from Axiom API
    
    -- Foreign key
    FOREIGN KEY ("orderId") REFERENCES orders("orderId") ON DELETE CASCADE,
    
    -- Constraints
    CONSTRAINT "trades_status_valid" CHECK ("status" IN (0, 1, 2)),
    CONSTRAINT "trades_rail_valid" CHECK ("rail" IN (0, 1))
);

-- Indexes
CREATE INDEX IF NOT EXISTS "idx_trades_orderId" ON trades("orderId");
CREATE INDEX IF NOT EXISTS "idx_trades_buyer" ON trades("buyer");
CREATE INDEX IF NOT EXISTS "idx_trades_status" ON trades("status");
CREATE INDEX IF NOT EXISTS "idx_trades_rail" ON trades("rail");
CREATE INDEX IF NOT EXISTS "idx_trades_transactionId" ON trades("transactionId");
CREATE INDEX IF NOT EXISTS "idx_trades_createdAt" ON trades("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_trades_status_createdAt" ON trades("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_trades_rail_status" ON trades("rail", "status");
CREATE INDEX IF NOT EXISTS "idx_trades_pdf_uploaded" ON trades("pdf_uploaded_at") WHERE "pdf_file" IS NOT NULL;

-- ============================================================================
-- WITHDRAWALS TABLE (Order Withdrawal History)
-- ============================================================================
CREATE TABLE IF NOT EXISTS withdrawals (
    "id" SERIAL PRIMARY KEY,
    "orderId" VARCHAR(66) NOT NULL,
    "amount" NUMERIC(78,0) NOT NULL,
    "remainingAfter" NUMERIC(78,0) NOT NULL,
    "txHash" VARCHAR(66),
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    FOREIGN KEY ("orderId") REFERENCES orders("orderId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_withdrawals_orderId" ON withdrawals("orderId");
CREATE INDEX IF NOT EXISTS "idx_withdrawals_createdAt" ON withdrawals("createdAt" DESC);

-- ============================================================================
-- ACCOUNT EMAILS TABLE (Email Notifications)
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_emails (
    "wallet" VARCHAR(42) PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    
    CONSTRAINT "account_emails_language_valid" CHECK ("language" IN ('en', 'zh-CN', 'zh-TW'))
);

CREATE INDEX IF NOT EXISTS "idx_account_emails_email" ON account_emails("email");
CREATE INDEX IF NOT EXISTS "idx_account_emails_enabled" ON account_emails("enabled") WHERE "enabled" = TRUE;

-- ============================================================================
-- EVENT SYNC STATE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_sync_state (
    contract_address VARCHAR(42) PRIMARY KEY,
    last_synced_block BIGINT NOT NULL DEFAULT 0,
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE orders IS 'Mirror of on-chain Order struct - plain text account info stored here (not on-chain)';
COMMENT ON TABLE trades IS 'Mirror of on-chain Trade struct - transactionId stored here, txIdHash sent to chain';
COMMENT ON TABLE withdrawals IS 'Withdrawal history for order activity timeline';
COMMENT ON TABLE event_sync_state IS 'Tracks last synced blockchain block for event listener';

COMMENT ON COLUMN orders."exchangeRate" IS 'CNY cents per token unit (e.g., 735 = 7.35 CNY/USDC)';
COMMENT ON COLUMN orders."remainingAmount" IS 'Remaining tokens - order is active if > 0';
COMMENT ON COLUMN orders."rail" IS 'PaymentRail: 0=ALIPAY, 1=WECHAT';
COMMENT ON COLUMN orders."accountId" IS 'Plain text account ID (NOT on-chain, only accountLinesHash is on-chain)';
COMMENT ON COLUMN orders."accountName" IS 'Plain text account name (NOT on-chain, only accountLinesHash is on-chain)';
COMMENT ON COLUMN orders."isPublic" IS 'Whether order appears in public listings';
COMMENT ON COLUMN orders."privateCode" IS '6-digit code for accessing private orders';

COMMENT ON COLUMN trades."status" IS 'TradeStatus: 0=PENDING, 1=SETTLED, 2=EXPIRED';
COMMENT ON COLUMN trades."transactionId" IS 'Alipay transaction ID from PDF (stored for display, txIdHash sent to chain)';
COMMENT ON COLUMN trades."feeAmount" IS 'Fee amount in token units from TradeCreated event';
