# pdf-utils

Rust library for PDF verification in zero-knowledge environments.

> **Note**: Minimal dependencies, no OpenSSL or C libs. Suitable for zkVMs and WASM.

## Crates

| Crate | Description |
|-------|-------------|
| `core` | Main API: `verify_and_extract()` |
| `extractor` | PDF text extraction |
| `signature-validator` | RSA signature verification |

## API

```rust
use pdf_core::verify_and_extract;

let pdf_bytes = std::fs::read("receipt.pdf")?;
let (pages, signature) = verify_and_extract(pdf_bytes)?;

println!("Valid: {}", signature.is_valid);
println!("Signer hash: {}", hex::encode(&signature.public_key_der_hash));
println!("Line 20: {}", pages[0].lines().nth(19).unwrap_or(""));
```

## Build

```bash
cargo build --release
```

## Features

- `openvm_accel` - Use OpenVM SHA-256 accelerator (for zkVM builds)

## Structure

```
pdf-utils/
├── core/               Main API
├── extractor/          Text extraction
├── signature-validator/ Signature verification
└── sample-pdfs/        Test files (not in git)
```
