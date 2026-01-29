# extractor

Extracts text content from PDF files.

## API

```rust
use extractor::extract_text;

pub fn extract_text(pdf_bytes: Vec<u8>) -> Result<Vec<String>, PdfError>
```

Returns a list of strings, one per page.

## Supported Encodings

| Encoding | Support |
|----------|---------|
| StandardEncoding | ✅ |
| WinAnsiEncoding | ✅ |
| MacRomanEncoding | ✅ |
| PDFDocEncoding | ✅ |
| ToUnicode CMap | ✅ |
| CID fonts | ✅ |

## Usage

```rust
use extractor::extract_text;

let pdf_bytes = std::fs::read("document.pdf").unwrap();
let pages = extract_text(pdf_bytes).unwrap();

for (i, page) in pages.iter().enumerate() {
    println!("=== Page {} ===", i + 1);
    for (line_num, line) in page.lines().enumerate() {
        println!("{}: {}", line_num + 1, line);
    }
}
```

## Build

```bash
cargo build -p extractor --release
```
