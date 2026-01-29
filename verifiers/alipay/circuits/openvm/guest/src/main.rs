// OpenVM Guest Program for PDF Verification
// Reads PDF + line numbers, outputs commitment to verified content
// Uses openvm_sha2 for accelerated SHA-256 hashing
//
// Privacy Design:
//   - account_lines_hash: SHA256(20 || line20 || 21 || line21) - seller info (stored with order)
//   - tx_id_hash: SHA256(25 || line25) - transaction ID only (passed as hash, never plaintext)
//   - time_amount_hash: SHA256(27 || line27 || 29 || line29) - time and amount (contract recomputes)
//   - output: SHA256(is_valid || pk_hash || account_lines_hash || tx_id_hash || time_amount_hash)
//
// This design ensures:
//   - Seller's account info is private (only hash stored on-chain)
//   - Transaction ID is private (only hash passed to contract)
//   - Payment time is public (for createdAt validation)
//   - Amount is verified against trade storage
//   - System remains trustless (all hashes verified against ZK proof)

use openvm::io::{read, read_vec, reveal_bytes32};
use openvm_sha2::sha256;
use pdf_core::verify_and_extract;

fn main() {
    // Read inputs
    let pdf_bytes: Vec<u8> = read_vec();
    let line_count: u32 = read();
    
    let mut line_numbers: Vec<u32> = Vec::with_capacity(line_count as usize);
    for _ in 0..line_count {
        line_numbers.push(read());
    }
    
    // Verify signature and extract text
    let (is_valid, pk_hash, extracted_lines) = match verify_and_extract(pdf_bytes) {
        Ok((pages, sig)) => {
            let page_text = pages.first().map(|s| s.as_str()).unwrap_or("");
            let lines: Vec<&str> = page_text.lines().collect();
            
            // Extract text at requested line numbers
            let extracted: Vec<String> = line_numbers.iter()
                .map(|&n| {
                    if n == 0 { return String::new(); }
                    lines.get(n as usize - 1)
                        .map(|s| s.to_string())
                        .unwrap_or_default()
                })
                .collect();
            
            (sig.is_valid, sig.public_key_der_hash, extracted)
        }
        Err(_) => (false, vec![0u8; 32], vec![]),
    };
    
    // Compute account_lines_hash = SHA256(20 || line20 || 21 || line21)
    // These are the seller's account info lines (indices 0, 1 in extracted_lines)
    // Line 20: "账户名：" + name (e.g., "账户名：张三")
    // Line 21: "账号：" + masked ID (e.g., "账号：138******88")
    let mut account_data = Vec::new();
    if extracted_lines.len() >= 2 {
        account_data.extend_from_slice(&line_numbers[0].to_le_bytes());  // 20
        account_data.extend_from_slice(extracted_lines[0].as_bytes());
        account_data.extend_from_slice(&line_numbers[1].to_le_bytes());  // 21
        account_data.extend_from_slice(extracted_lines[1].as_bytes());
    }
    let account_lines_hash = sha256(&account_data);
    
    // Compute tx_id_hash = SHA256(25 || line25)
    // Line 25: Transaction ID (e.g., "2024012712345678901234567890")
    // This hash is passed to the contract (never the plaintext txId)
    let mut tx_id_data = Vec::new();
    if extracted_lines.len() >= 3 {
        tx_id_data.extend_from_slice(&line_numbers[2].to_le_bytes());  // 25
        tx_id_data.extend_from_slice(extracted_lines[2].as_bytes());
    }
    let tx_id_hash = sha256(&tx_id_data);
    
    // Compute time_amount_hash = SHA256(27 || line27 || 29 || line29)
    // Line 27: Payment time (e.g., "2026-01-28 09:37:58") - no prefix, just datetime
    // Line 29: Amount with prefix (e.g., "小写：1.00")
    // The contract recomputes this from plaintext paymentTime + formatted fiatAmount
    let mut time_amount_data = Vec::new();
    if extracted_lines.len() >= 5 {
        time_amount_data.extend_from_slice(&line_numbers[3].to_le_bytes());  // 27
        time_amount_data.extend_from_slice(extracted_lines[3].as_bytes());
        time_amount_data.extend_from_slice(&line_numbers[4].to_le_bytes());  // 29
        time_amount_data.extend_from_slice(extracted_lines[4].as_bytes());
    }
    let time_amount_hash = sha256(&time_amount_data);
    
    // Compute output = SHA256(is_valid || pk_hash || account_lines_hash || tx_id_hash || time_amount_hash)
    let mut output_data = Vec::with_capacity(1 + 32 + 32 + 32 + 32);
    output_data.push(is_valid as u8);
    output_data.extend_from_slice(&pk_hash);
    output_data.extend_from_slice(&account_lines_hash);
    output_data.extend_from_slice(&tx_id_hash);
    output_data.extend_from_slice(&time_amount_hash);
    let output = sha256(&output_data);
    
    reveal_bytes32(output);
}
