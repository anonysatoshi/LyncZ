//! Auto-Cancellation Service for LyncZ
//! 
//! Monitors for expired trades and automatically cancels them,
//! returning escrowed funds to sellers.
//! 
//! Runs as a separate process alongside the API server.
//! The relay wallet pays gas fees for each cancellation (~0.0001 ETH on L2).

use std::sync::Arc;
use std::time::Duration;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use lyncz_relay::{Config, Database};
use lyncz_relay::blockchain::client::EthereumClient;

/// Check interval for expired trades (30 seconds)
const CHECK_INTERVAL_SECS: u64 = 30;

/// Status codes matching the smart contract (from LyncZEscrow.sol enum TradeStatus)
#[allow(dead_code)]
const TRADE_STATUS_PENDING: i32 = 0;  // Trade created, waiting for payment proof
#[allow(dead_code)]
const TRADE_STATUS_SETTLED: i32 = 1;  // Trade completed, tokens released to buyer
const TRADE_STATUS_EXPIRED: i32 = 2;  // Trade expired, tokens returned to order pool

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "info,lyncz_relay=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🕐 Starting LyncZ Auto-Cancellation Service");

    let config = Config::load()?;
    config.log_summary();

    // Connect to database
    let db = Database::new(&config.database_url).await?;
    tracing::info!("✅ Database connected");

    // Initialize blockchain client
    let eth_client = EthereumClient::from_config(&config).await?;
    let eth_client = Arc::new(eth_client);
    tracing::info!("✅ Blockchain client initialized");
    tracing::info!("   Relayer address: {:?}", eth_client.relayer_address());

    // Track total gas spent for logging
    let mut total_gas_spent_wei: u128 = 0;
    let mut total_trades_cancelled: u64 = 0;

    tracing::info!("🔄 Starting monitoring loop (check every {} seconds)", CHECK_INTERVAL_SECS);

    loop {
        match check_and_cancel_expired(&db, &eth_client).await {
            Ok((cancelled_count, gas_spent)) => {
                if cancelled_count > 0 {
                    total_trades_cancelled += cancelled_count;
                    total_gas_spent_wei += gas_spent;
                    
                    let gas_eth = gas_spent as f64 / 1e18;
                    let total_gas_eth = total_gas_spent_wei as f64 / 1e18;
                    
                    tracing::info!(
                        "✅ Cancelled {} trades (gas: {:.6} ETH) | Total: {} trades, {:.6} ETH",
                        cancelled_count,
                        gas_eth,
                        total_trades_cancelled,
                        total_gas_eth
                    );
                }
            }
            Err(e) => {
                tracing::error!("❌ Error checking expired trades: {}", e);
            }
        }

        tokio::time::sleep(Duration::from_secs(CHECK_INTERVAL_SECS)).await;
    }
}

/// Check for expired trades and cancel them
/// Returns (number_cancelled, total_gas_spent_wei)
async fn check_and_cancel_expired(
    db: &Database,
    eth_client: &Arc<EthereumClient>,
) -> Result<(u64, u128), Box<dyn std::error::Error + Send + Sync>> {
    // Get all expired pending trades from database
    let expired_trades = db.get_expired_pending_trades().await?;
    
    if expired_trades.is_empty() {
        return Ok((0, 0));
    }

    tracing::info!("📋 Found {} expired trades to cancel", expired_trades.len());

    let mut cancelled_count = 0u64;
    let mut total_gas_wei = 0u128;

    for trade in expired_trades {
        let trade_id = &trade.trade_id;
        
        // Parse trade_id to bytes32
        let trade_id_bytes = parse_trade_id(trade_id)?;
        
        tracing::info!("🔄 Cancelling trade: {}", trade_id);
        
        match eth_client.cancel_expired_trade(trade_id_bytes).await {
            Ok((tx_hash, gas_cost)) => {
                tracing::info!(
                    "✅ Trade {} cancelled: tx={:#x}, gas_cost={} wei ({:.6} ETH)",
                    trade_id,
                    tx_hash,
                    gas_cost,
                    gas_cost.as_u128() as f64 / 1e18
                );
                
                // Update database status
                if let Err(e) = db.update_trade_status(trade_id, TRADE_STATUS_EXPIRED).await {
                    tracing::warn!("⚠️ Failed to update DB status for {}: {}", trade_id, e);
                }
                
                cancelled_count += 1;
                total_gas_wei += gas_cost.as_u128();
            }
            Err(e) => {
                // This can happen if:
                // - Trade was already cancelled by someone else
                // - Trade was settled just in time
                // - Transaction reverted for other reasons
                tracing::warn!(
                    "⚠️ Failed to cancel trade {}: {}",
                    trade_id,
                    e
                );
            }
        }
    }

    Ok((cancelled_count, total_gas_wei))
}

/// Parse trade_id string (0x...) to [u8; 32]
fn parse_trade_id(trade_id: &str) -> Result<[u8; 32], Box<dyn std::error::Error + Send + Sync>> {
    let trade_id = trade_id.strip_prefix("0x").unwrap_or(trade_id);
    let bytes = hex::decode(trade_id)?;
    
    if bytes.len() != 32 {
        return Err(format!("Trade ID must be 32 bytes, got {}", bytes.len()).into());
    }
    
    let mut result = [0u8; 32];
    result.copy_from_slice(&bytes);
    Ok(result)
}

