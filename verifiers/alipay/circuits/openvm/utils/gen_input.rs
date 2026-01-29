use std::{env, fs};

/// OpenVM CLI input generator for zkPDF
/// Usage: cargo run --bin gen_input -- --pdf <path> --lines <n1,n2,...>

fn main() {
    let args: Vec<String> = env::args().collect();
    
    let pdf_path = get_arg(&args, "--pdf");
    let lines_str = get_arg(&args, "--lines");
    
    let line_numbers: Vec<u32> = lines_str
        .split(',')
        .map(|s| s.trim().parse().expect("Invalid line number"))
        .collect();
    
    let pdf_bytes = fs::read(&pdf_path).expect("Failed to read PDF");
    
    // Build streams: [pdf_bytes, line_count, line_num1, line_num2, ...]
    let mut streams = vec![to_hex_stream_raw(&pdf_bytes)];
    streams.push(to_hex_stream(&(line_numbers.len() as u32)));
    for num in &line_numbers {
        streams.push(to_hex_stream(num));
    }
    
    let output = serde_json::json!({"input": streams});
    fs::write("../guest/cli_input.json", serde_json::to_string_pretty(&output).unwrap())
        .expect("Failed to write");
    
    println!("✅ {} streams | PDF: {} bytes | Lines: {:?}", 
             streams.len(), pdf_bytes.len(), line_numbers);
}

fn get_arg(args: &[String], flag: &str) -> String {
    args.iter()
        .position(|s| s == flag)
        .and_then(|i| args.get(i + 1))
        .cloned()
        .unwrap_or_else(|| panic!("Missing {}", flag))
}

fn to_hex_stream<T: serde::Serialize>(value: &T) -> String {
    let words = openvm::serde::to_vec(value).unwrap();
    let bytes: Vec<u8> = words.into_iter().flat_map(|w| w.to_le_bytes()).collect();
    format!("0x01{}", hex::encode(bytes))
}

fn to_hex_stream_raw(data: &[u8]) -> String {
    // Pad to 4-byte alignment
    let padding = (4 - (data.len() % 4)) % 4;
    let mut padded = data.to_vec();
    padded.extend(vec![0u8; padding]);
    format!("0x01{}", hex::encode(padded))
}
