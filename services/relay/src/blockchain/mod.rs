// Blockchain integration module
// LyncZ: Multi-rail escrow with ZK verification

pub mod client;
pub mod events;
pub mod types;

use ethers::prelude::abigen;

// Generate contract bindings from ABI files
abigen!(
    LyncZEscrow,
    "./abi/LyncZEscrow.json",
    event_derives(serde::Deserialize, serde::Serialize)
);

abigen!(
    AlipayVerifier,
    "./abi/AlipayVerifier.json"
);

abigen!(
    SimpleFeeCalculator,
    "./abi/SimpleFeeCalculator.json"
);

abigen!(
    IERC20,
    "./abi/IERC20.json"
);

