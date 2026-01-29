pub use extractor::extract_text;
pub use signature_validator::{verify_pdf_signature, PdfSignatureResult};

/// Verify PDF signature and extract text from all pages.
/// 
/// # Returns
/// * `Ok((pages, signature))` - Vec of page text strings and signature result
/// 
/// Note: Even if signature is invalid, we return the result with is_valid=false.
/// The commitment hash will differ, so verification will fail naturally.
pub fn verify_and_extract(pdf_bytes: Vec<u8>) -> Result<(Vec<String>, PdfSignatureResult), String> {
    let signature = verify_pdf_signature(&pdf_bytes)
        .map_err(|e| format!("signature error: {}", e))?;

    let pages = extract_text(pdf_bytes)
        .map_err(|e| format!("text extraction error: {:?}", e))?;

    Ok((pages, signature))
}
