# signature-validator

Verifies digital signatures embedded in PDF files (PKCS#7/CMS SignedData).

## API

```rust
use signature_validator::{verify_pdf_signature, PdfSignatureResult};

pub fn verify_pdf_signature(pdf_bytes: &[u8]) -> Result<PdfSignatureResult, String>
```

### PdfSignatureResult

```rust
pub struct PdfSignatureResult {
    pub is_valid: bool,
    pub public_key_der_hash: Vec<u8>,  // SHA256 of signer's SPKI DER
}
```

## How It Works

### 1. Content Integrity Check

```
Hash(signed_bytes) == MessageDigest
```

The `ByteRange` in the PDF specifies which bytes were signed. We hash those bytes and compare with the stored `MessageDigest`.

### 2. Signature Authenticity Check

```
Verify(PublicKey, Hash(signed_attributes), Signature) == true
```

The `signed_attributes` contain metadata including the `MessageDigest`. We verify the RSA signature over these attributes.

### Algorithm Support

| Algorithm | Support |
|-----------|---------|
| SHA-256 with RSA | ✅ Yes |

> Note: Optimized for Alipay receipts. SHA-256 is hardcoded for performance.

## Build

```bash
cargo build -p signature-validator --release
```

## Features

- `openvm_accel` - Use OpenVM SHA-256 accelerator
