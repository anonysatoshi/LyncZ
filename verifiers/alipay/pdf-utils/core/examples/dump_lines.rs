use std::{env, fs};
use core::verify_and_extract;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("Usage: dump_lines <pdf_path>");
        std::process::exit(1);
    }
    
    let pdf_bytes = fs::read(&args[1]).expect("Failed to read PDF");
    
    match verify_and_extract(pdf_bytes) {
        Ok((pages, sig)) => {
            println!("=== PDF Signature ===");
            println!("Valid: {}", sig.is_valid);
            println!("Public Key Hash: {}", hex::encode(&sig.public_key_der_hash));
            println!();
            
            for (page_idx, page_text) in pages.iter().enumerate() {
                println!("=== Page {} ===", page_idx);
                for (line_idx, line) in page_text.lines().enumerate() {
                    println!("{:2} | {}", line_idx + 1, line);
                }
                println!();
            }
        }
        Err(e) => {
            eprintln!("Error: {}", e);
            std::process::exit(1);
        }
    }
}

