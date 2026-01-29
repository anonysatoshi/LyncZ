# core

Main API for PDF verification. Combines signature validation and text extraction.

## API

```rust
use pdf_core::{verify_and_extract, PdfSignatureResult};

/// Verify PDF signature and extract text from all pages.
pub fn verify_and_extract(pdf_bytes: Vec<u8>) 
    -> Result<(Vec<String>, PdfSignatureResult), String>
```

### Returns

- `pages: Vec<String>` - Text content of each page
- `signature: PdfSignatureResult` - Signature verification result
  - `is_valid: bool` - Whether signature is valid
  - `public_key_der_hash: Vec<u8>` - SHA256 of signer's public key DER

## Usage

```rust
use pdf_core::verify_and_extract;

let pdf_bytes = std::fs::read("receipt.pdf").unwrap();
let (pages, sig) = verify_and_extract(pdf_bytes).expect("Failed");

assert!(sig.is_valid);

// Extract specific lines (0-indexed)
let lines: Vec<&str> = pages[0].lines().collect();
println!("Line 20: {}", lines.get(19).unwrap_or(&""));
```

## Build

```bash
cargo build -p core --release
```
