//! Configuration management for LyncZ relay backend
//! 
//! Loads configuration from environment variables.
//! Most blockchain-related values (verifier addresses, trade limits, etc.)
//! are fetched directly from the smart contracts at runtime.

use std::env;

/// Main configuration struct - only essential runtime values
#[derive(Debug, Clone)]
pub struct Config {
    // Database
    pub database_url: String,
    
    // API Server
    pub api_host: String,
    pub api_port: u16,
    
    // Blockchain
    pub chain_id: u64,
    pub rpc_url: String,
    pub escrow_address: String,
    
    // Relayer (for signing transactions)
    pub relayer_private_key: Option<String>,
    
    // Axiom API (for ZK proof generation)
    pub axiom_api_key: Option<String>,
    
    // Email service (for notifications)
    pub resend_api_key: Option<String>,
}

impl Config {
    /// Load configuration from environment variables
    pub fn load() -> Result<Self, ConfigError> {
        // Database (required for production, has dev default)
        let database_url = env::var("DATABASE_URL")
            .unwrap_or_else(|_| "postgres://lyncz:lyncz_dev@localhost:5432/lyncz_orderbook".to_string());
        
        // API Server
        let api_host = env::var("API_HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let api_port = env::var("PORT")
            .or_else(|_| env::var("API_PORT"))
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .unwrap_or(8080);
        
        // Blockchain
        let chain_id = env::var("CHAIN_ID")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(8453); // Base mainnet default
        
        let rpc_url = env::var("RPC_URL")
            .unwrap_or_else(|_| "https://mainnet.base.org".to_string());
        
        // Escrow contract address (required)
        let escrow_address = env::var("ESCROW_ADDRESS")
            .or_else(|_| env::var("ESCROW_CONTRACT_ADDRESS"))
            .map_err(|_| ConfigError::Missing("ESCROW_ADDRESS".to_string()))?;
        
        // Relayer private key (for fillOrder, submitProof, cancelExpiredTrade)
        let relayer_private_key = env::var("RELAYER_PRIVATE_KEY").ok();
        
        // Axiom API key (for ZK proof generation)
        let axiom_api_key = env::var("AXIOM_API_KEY").ok();
        
        // Resend API key (for email notifications)
        let resend_api_key = env::var("RESEND_API_KEY").ok();
        
        Ok(Config {
            database_url,
            api_host,
            api_port,
            chain_id,
            rpc_url,
            escrow_address,
            relayer_private_key,
            axiom_api_key,
            resend_api_key,
        })
    }
    
    /// Log current configuration (hiding secrets)
    pub fn log_summary(&self) {
        tracing::info!("=== LyncZ Configuration ===");
        tracing::info!("Network: Chain ID {}", self.chain_id);
        tracing::info!("RPC: {}...", &self.rpc_url[..50.min(self.rpc_url.len())]);
        tracing::info!("Escrow: {}", self.escrow_address);
        tracing::info!("Relayer: {}", if self.relayer_private_key.is_some() { "✅ Set" } else { "❌ Not set" });
        tracing::info!("Axiom API: {}", if self.axiom_api_key.is_some() { "✅ Set" } else { "❌ Not set" });
        tracing::info!("Resend API: {}", if self.resend_api_key.is_some() { "✅ Set" } else { "❌ Not set" });
        tracing::info!("===========================");
    }
}

#[derive(Debug)]
pub enum ConfigError {
    Missing(String),
    #[allow(dead_code)]
    Invalid(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::Missing(var) => write!(f, "Missing required config: {}", var),
            ConfigError::Invalid(msg) => write!(f, "Invalid config: {}", msg),
        }
    }
}

impl std::error::Error for ConfigError {}
