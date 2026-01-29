// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/verifiers/AlipayVerifier.sol";
import "../src/LyncZEscrow.sol";

/**
 * @title UpdateAlipayVerifier
 * @notice Deploys new AlipayVerifier and updates LyncZEscrow to use it
 * 
 * Usage:
 *   forge script script/UpdateAlipayVerifier.s.sol:UpdateAlipayVerifier \
 *     --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast
 */
contract UpdateAlipayVerifier is Script {
    // Existing deployments on Base Mainnet
    address constant HALO2_VERIFIER = 0x0db61FC765A794eD9Fab44b03f57d77dB03e96aB;
    address constant LYNCZ_ESCROW = 0xe39291f7Fd7a072C238154fd1e673C37Af18917c;
    
    // ZK config (from cargo openvm setup / cargo openvm build)
    bytes32 constant APP_EXE_COMMIT = 0x008520e2abfd76f39acd204058da6d3526427361dfb79bbdf2db4b5de30accbc;
    bytes32 constant APP_VM_COMMIT = 0x0053b850b281802e42a58b63fe114a0797f8092777f9bbf01df5800fba3c761c;
    
    // Alipay digital signature public key hash (SHA256 of DER-encoded public key)
    bytes32 constant ALIPAY_PUBLIC_KEY_HASH = 0x76ec7b1d41a9d77e529975a3e37597e6b9096fdc21433d16e4993dab83f826be;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("");
        console.log("========================================");
        console.log("   Update AlipayVerifier Script         ");
        console.log("========================================");
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. Deploy new AlipayVerifier
        console.log("");
        console.log("--- Deploying new AlipayVerifier ---");
        AlipayVerifier newVerifier = new AlipayVerifier(
            HALO2_VERIFIER,
            APP_EXE_COMMIT,
            APP_VM_COMMIT,
            ALIPAY_PUBLIC_KEY_HASH
        );
        console.log("New AlipayVerifier:", address(newVerifier));
        
        // 2. Update LyncZEscrow to use new verifier
        console.log("");
        console.log("--- Updating LyncZEscrow ---");
        LyncZEscrow escrow = LyncZEscrow(LYNCZ_ESCROW);
        escrow.setVerifier(LyncZEscrow.PaymentRail.ALIPAY, address(newVerifier));
        console.log("Set ALIPAY verifier to:", address(newVerifier));
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("========================================");
        console.log("         UPDATE COMPLETE                ");
        console.log("========================================");
        console.log("New AlipayVerifier:", address(newVerifier));
        console.log("LyncZEscrow:", LYNCZ_ESCROW);
        console.log("");
    }
}

