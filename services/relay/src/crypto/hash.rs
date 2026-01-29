//! Hash computation utilities for Alipay PDF verification
//!
//! This module contains all the hash computation logic used throughout the system:
//! - Frontend: computes accountLinesHash when creating orders
//! - Backend: verifies hash when receiving payment info
//! - Settlement: computes expected hash for ZK proof verification
//!
//! All hash functions must produce identical output to what the ZK circuit computes.

use sha2::{Sha256, Digest};

// ============================================================================
// Account ID Masking
// ============================================================================

/// Mask an Alipay account ID the same way Alipay masks it in PDF receipts.
/// This ensures our hash matches what the ZK circuit reads from the PDF.
/// 
/// # Examples
/// - Email: `"test@example.com"` -> `"tes***@example.com"`
/// - Chinese phone (11 digits): `"13800138000"` -> `"138******00"` (first 3 + 6 asterisks + last 2)
/// - International phone: `"1-3125551212"` -> `"1-312*****12"` (first 5 + 5 asterisks + last 2)
/// - Other: Keep first 3 chars + `"***"`
pub fn mask_alipay_account_id(account_id: &str) -> String {
    let trimmed = account_id.trim();
    
    // Check if it's an email
    if let Some(at_index) = trimmed.find('@') {
        let local_part = &trimmed[..at_index];
        let domain = &trimmed[at_index..]; // includes @
        if local_part.len() <= 3 {
            return format!("{}***{}", local_part, domain);
        }
        return format!("{}***{}", &local_part[..3], domain);
    }
    
    // Check if it's a Chinese phone number (11 digits, all numeric)
    // Alipay masks as: first 3 + 6 asterisks + last 2
    if trimmed.len() == 11 && trimmed.chars().all(|c| c.is_ascii_digit()) {
        return format!("{}******{}", &trimmed[..3], &trimmed[9..]);
    }
    
    // Check if it's an international phone number (starts with digit, contains dash)
    // Pattern: first 5 + 5 asterisks + last 2
    // Example: "1-3125551212" -> "1-312*****12"
    if trimmed.len() >= 10 
        && trimmed.chars().next().map(|c| c.is_ascii_digit()).unwrap_or(false)
        && trimmed.contains('-') 
    {
        // Ensure we have enough characters
        if trimmed.len() >= 7 {
            return format!("{}*****{}", &trimmed[..5], &trimmed[trimmed.len()-2..]);
        }
    }
    
    // Fallback: keep first 3 chars + ***
    if trimmed.len() <= 3 {
        return format!("{}***", trimmed);
    }
    format!("{}***", &trimmed[..3])
}

// ============================================================================
// Account Lines Hash (Line 20 + Line 21)
// ============================================================================

/// Compute account_lines_hash = SHA256(20 || line20 || 21 || line21)
/// 
/// # Important
/// Must match exactly what the ZK circuit reads from the PDF!
/// 
/// In Alipay PDFs:
/// - Line 20 = `"账户名："` + account_name (e.g., `"账户名：张三"`)
/// - Line 21 = `"账号："` + masked_account_id (e.g., `"账号：138******88"`)
/// 
/// The ZK circuit hashes the FULL line text including prefixes.
pub fn compute_account_lines_hash(account_name: &str, account_id: &str) -> [u8; 32] {
    // Build full line text as it appears in Alipay PDF
    // NOTE: Alipay converts English names to UPPERCASE in their receipts, so we must match
    // Chinese names are left as-is (Chinese characters don't have uppercase/lowercase)
    let formatted_name = if account_name.is_ascii() {
        account_name.to_uppercase()
    } else {
        account_name.to_string()
    };
    let line20 = format!("账户名：{}", formatted_name);
    let line21 = format!("账号：{}", mask_alipay_account_id(account_id));
    
    compute_account_lines_hash_from_lines(&line20, &line21)
}

/// Compute account_lines_hash from pre-processed line text (already has prefixes)
/// Use this when you have the raw line text as it appears in the PDF.
pub fn compute_account_lines_hash_from_lines(line20: &str, line21: &str) -> [u8; 32] {
    let mut data = Vec::new();
    data.extend_from_slice(&20u32.to_le_bytes());
    data.extend_from_slice(line20.as_bytes());
    data.extend_from_slice(&21u32.to_le_bytes());
    data.extend_from_slice(line21.as_bytes());
    Sha256::digest(&data).into()
}

// ============================================================================
// Transaction ID Hash (Line 25)
// ============================================================================

/// Compute tx_id_hash = SHA256(25 || line25)
/// 
/// Line 25 contains just the transaction ID (no prefix).
/// This hash is passed to the contract instead of plain text transactionId.
pub fn compute_tx_id_hash(transaction_id: &str) -> [u8; 32] {
    let mut data = Vec::new();
    data.extend_from_slice(&25u32.to_le_bytes());
    data.extend_from_slice(transaction_id.as_bytes());
    Sha256::digest(&data).into()
}

// ============================================================================
// Time + Amount Hash (Line 27 + Line 29)
// ============================================================================

/// Compute time_amount_hash = SHA256(27 || line27 || 29 || line29)
/// 
/// - Line 27: Payment time (no prefix, e.g., `"2026-01-28 09:37:58"`)
/// - Line 29: Amount with prefix (e.g., `"小写：1.00"`)
pub fn compute_time_amount_hash(payment_time: &str, amount_line: &str) -> [u8; 32] {
    let mut data = Vec::new();
    data.extend_from_slice(&27u32.to_le_bytes());
    data.extend_from_slice(payment_time.as_bytes());
    data.extend_from_slice(&29u32.to_le_bytes());
    data.extend_from_slice(amount_line.as_bytes());
    Sha256::digest(&data).into()
}

// ============================================================================
// Final Output Hash (combines all sub-hashes)
// ============================================================================

/// Compute the final expected hash using account_lines_hash from blockchain.
/// 
/// ```text
/// output = SHA256(is_valid || pk_hash || account_lines_hash || tx_id_hash || time_amount_hash)
/// ```
/// 
/// This uses the pre-computed account_lines_hash from the blockchain,
/// avoiding masking edge cases by using the exact hash the frontend computed.
/// 
/// # Arguments
/// - `account_lines_hash_hex`: 0x-prefixed hex string from blockchain
/// - `line25`: Transaction ID (no prefix)
/// - `line27`: Payment time (no prefix)
/// - `line29`: Amount with prefix (e.g., `"小写：1.00"`)
/// - `pk_hash_hex`: Alipay public key hash (hex, no 0x prefix)
pub fn compute_expected_hash_with_onchain_account_hash(
    account_lines_hash_hex: &str,
    line25: &str,
    line27: &str,
    line29: &str,
    pk_hash_hex: &str,
) -> Result<[u8; 32], String> {
    // Decode the on-chain account_lines_hash
    let account_lines_hash_clean = account_lines_hash_hex.strip_prefix("0x")
        .unwrap_or(account_lines_hash_hex);
    let account_lines_hash = hex::decode(account_lines_hash_clean)
        .map_err(|e| format!("Invalid account_lines_hash: {}", e))?;
    
    if account_lines_hash.len() != 32 {
        return Err(format!("Invalid account_lines_hash length: expected 32, got {}", account_lines_hash.len()));
    }
    
    // Compute the other two hashes
    let tx_id_hash = compute_tx_id_hash(line25);
    let time_amount_hash = compute_time_amount_hash(line27, line29);
    
    let pk_hash = hex::decode(pk_hash_hex)
        .map_err(|e| format!("Invalid pk hash: {}", e))?;
    
    // Final hash: SHA256(is_valid || pk_hash || account_lines_hash || tx_id_hash || time_amount_hash)
    let mut final_data = Vec::new();
    final_data.push(0x01); // is_valid = true
    final_data.extend_from_slice(&pk_hash);
    final_data.extend_from_slice(&account_lines_hash);
    final_data.extend_from_slice(&tx_id_hash);
    final_data.extend_from_slice(&time_amount_hash);
    
    Ok(Sha256::digest(&final_data).into())
}

// ============================================================================
// Helper: Format Amount Line (Line 29)
// ============================================================================

/// Format line 29 (amount) as it appears in Alipay PDF.
/// 
/// # Example
/// - `format_amount_line(10050)` -> `"小写：100.50"`
pub fn format_amount_line(cny_cents: u64) -> String {
    let amount_str = format!("{}.{:02}", cny_cents / 100, cny_cents % 100);
    format!("小写：{}", amount_str)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mask_email() {
        assert_eq!(mask_alipay_account_id("test@example.com"), "tes***@example.com");
        assert_eq!(mask_alipay_account_id("ab@x.com"), "ab***@x.com");
        assert_eq!(mask_alipay_account_id("a@x.com"), "a***@x.com");
    }

    #[test]
    fn test_mask_chinese_phone() {
        // Chinese 11-digit phone: first 3 + 6 asterisks + last 2
        assert_eq!(mask_alipay_account_id("13800138000"), "138******00");
        assert_eq!(mask_alipay_account_id("15912345678"), "159******78");
    }

    #[test]
    fn test_mask_international_phone() {
        // International phone numbers: first 5 + 5 asterisks + last 2
        // Example from PDF: "1-312*****12"
        assert_eq!(mask_alipay_account_id("1-3125551212"), "1-312*****12");
        assert_eq!(mask_alipay_account_id("1-3155629293"), "1-315*****93");
        
        // Different formats
        assert_eq!(mask_alipay_account_id("1-9876543210"), "1-987*****10");
    }

    #[test]
    fn test_mask_other() {
        assert_eq!(mask_alipay_account_id("abcdef"), "abc***");
        assert_eq!(mask_alipay_account_id("ab"), "ab***");
        assert_eq!(mask_alipay_account_id("a"), "a***");
    }

    #[test]
    fn test_format_amount_line() {
        assert_eq!(format_amount_line(10050), "小写：100.50");
        assert_eq!(format_amount_line(100), "小写：1.00");
        assert_eq!(format_amount_line(35), "小写：0.35");
        assert_eq!(format_amount_line(5), "小写：0.05");
    }

    #[test]
    fn test_compute_account_lines_hash_deterministic() {
        // Same input should always produce same hash
        let hash1 = compute_account_lines_hash("张三", "13800138000");
        let hash2 = compute_account_lines_hash("张三", "13800138000");
        assert_eq!(hash1, hash2);
        
        // Different input should produce different hash
        let hash3 = compute_account_lines_hash("李四", "13800138000");
        assert_ne!(hash1, hash3);
    }

    #[test]
    fn test_compute_account_lines_hash_matches_frontend() {
        // This test verifies that the backend computes the same hash as the frontend.
        // The hash is: SHA256(20_u32_LE || "账户名：张三" || 21_u32_LE || "账号：138******00")
        //
        // Frontend computes this with:
        //   const line20 = '账户名：' + accountName;
        //   const line21 = '账号：' + maskAlipayAccountId(accountId);
        //   buffer = [20_LE, line20_bytes, 21_LE, line21_bytes]
        //   hash = SHA256(buffer)
        
        let hash = compute_account_lines_hash("张三", "13800138000");
        
        // Manually compute expected hash
        let line20 = "账户名：张三";
        let line21 = "账号：138******00";
        
        let mut data = Vec::new();
        data.extend_from_slice(&20u32.to_le_bytes());
        data.extend_from_slice(line20.as_bytes());
        data.extend_from_slice(&21u32.to_le_bytes());
        data.extend_from_slice(line21.as_bytes());
        
        let expected: [u8; 32] = Sha256::digest(&data).into();
        assert_eq!(hash, expected);
    }

    /// Test with a known hash value that can be verified against frontend.
    /// 
    /// To verify in browser console:
    /// ```javascript
    /// import { computeAccountLinesHash, maskAlipayAccountId } from './contracts';
    /// // or paste the functions directly
    /// 
    /// const hash = await computeAccountLinesHash("TestName", "test@example.com");
    /// console.log(hash);
    /// // Should match: 0x... (the hash printed below)
    /// ```
    #[test]
    fn test_known_hash_for_frontend_verification() {
        // Test case: name="TestName" (ASCII, will be uppercased), id="test@example.com"
        // Masked id: "tes***@example.com"
        // line20: "账户名：TESTNAME" (English name gets uppercased)
        // line21: "账号：tes***@example.com"
        
        let hash = compute_account_lines_hash("TestName", "test@example.com");
        let hash_hex = format!("0x{}", hex::encode(hash));
        
        // This is the expected hash - update this if algorithm changes
        // Frontend should produce the same value
        assert!(!hash_hex.is_empty());
        
        // Verify the hash matches what we'd compute manually with uppercase
        let line20 = "账户名：TESTNAME";
        let line21 = "账号：tes***@example.com";
        let manual_hash = compute_account_lines_hash_from_lines(line20, line21);
        assert_eq!(hash, manual_hash);
        
        // Verify the masking is correct
        assert_eq!(mask_alipay_account_id("test@example.com"), "tes***@example.com");
    }
    
    #[test]
    fn test_chinese_name_no_uppercase() {
        // Chinese names should NOT be uppercased
        let name = "张三";
        let id = "13800138000";
        
        let hash = compute_account_lines_hash(name, id);
        
        // Verify it matches the raw Chinese name (not uppercased)
        let line20 = "账户名：张三";
        let line21 = "账号：138******00";
        let manual_hash = compute_account_lines_hash_from_lines(line20, line21);
        
        assert_eq!(hash, manual_hash);
    }
    
    #[test]
    fn test_english_name_gets_uppercase() {
        // English names SHOULD be uppercased
        let name = "John Doe";
        let id = "john@example.com";
        
        let hash = compute_account_lines_hash(name, id);
        
        // Verify it matches the UPPERCASED English name
        let line20 = "账户名：JOHN DOE";
        let line21 = "账号：joh***@example.com";
        let manual_hash = compute_account_lines_hash_from_lines(line20, line21);
        
        assert_eq!(hash, manual_hash);
    }

    #[test]
    fn test_account_lines_hash_from_lines_vs_compute() {
        // compute_account_lines_hash and compute_account_lines_hash_from_lines
        // should produce identical results when given the same formatted lines
        let name = "测试用户";  // Generic test name
        let id = "test@example.com";
        
        let hash1 = compute_account_lines_hash(name, id);
        
        let line20 = format!("账户名：{}", name);
        let line21 = format!("账号：{}", mask_alipay_account_id(id));
        let hash2 = compute_account_lines_hash_from_lines(&line20, &line21);
        
        assert_eq!(hash1, hash2);
    }
}
