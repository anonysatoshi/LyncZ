pub mod pkcs7_parser;
pub mod signed_bytes_extractor;

use num_bigint::{BigInt, Sign};
use pkcs7_parser::{parse_signed_data, VerifierParams};
use rsa::{Pkcs1v15Sign, RsaPublicKey};
use sha2::Sha256;

#[cfg(feature = "openvm_accel")]
use openvm_sha2 as openvm_sha256_crate;

#[cfg(not(feature = "openvm_accel"))]
use sha2::Digest;

use signed_bytes_extractor::get_signature_der;
use simple_asn1::{oid, to_der, ASN1Block};

/// Minimal signature result - only essential fields for Alipay verification
#[derive(Debug, Clone)]
pub struct PdfSignatureResult {
    pub is_valid: bool,
    pub public_key_der_hash: Vec<u8>,
}

/// Extract public key DER hash from PDF WITHOUT verification (fast)
/// Use this for optimistic workflows where we just need the key hash
pub fn extract_public_key_hash(pdf_bytes: &[u8]) -> Result<Vec<u8>, String> {
    // Extract signature DER from PDF
    let (signature_der, _signed_data) = get_signature_der(pdf_bytes)
        .map_err(|e| format!("Failed to extract signature: {}", e))?;

    // Parse PKCS#7 to get public key components
    let params = parse_signed_data(&signature_der)
        .map_err(|e| format!("Failed to parse signature: {}", e))?;

    // Build SPKI DER and hash it
    let spki_der = build_spki_der(&params)?;
    let spki_hash = sha256_hash(&spki_der);

    Ok(spki_hash)
}

/// Verify PDF signature and return essential result
/// Alipay PDFs use SHA-256 with RSA - this is hardcoded for performance
pub fn verify_pdf_signature(pdf_bytes: &[u8]) -> Result<PdfSignatureResult, String> {
    // Extract signature DER and signed data from PDF
    let (signature_der, signed_data) = get_signature_der(pdf_bytes)
        .map_err(|e| format!("Failed to extract signature: {}", e))?;

    // Parse PKCS#7 signed data
    let params = parse_signed_data(&signature_der)
        .map_err(|e| format!("Failed to parse signature: {}", e))?;

    // Calculate hash of signed data (SHA-256 for Alipay)
    let calculated_hash = sha256_hash(&signed_data);

    // Verify message digest matches
    if params.signed_data_message_digest != calculated_hash {
        return Ok(PdfSignatureResult {
            is_valid: false,
            public_key_der_hash: Vec::new(),
        });
    }

    // Create RSA public key and verify signature
    let pub_key = RsaPublicKey::new(
        rsa::BigUint::from_bytes_be(&params.modulus),
        rsa::BigUint::from_bytes_be(&params.exponent.to_bytes_be()),
    )
    .map_err(|e| e.to_string())?;

    let signature_valid = pub_key
        .verify(
            Pkcs1v15Sign::new::<Sha256>(),
            &params.signed_attr_digest,
            &params.signature,
        )
        .is_ok();

    if !signature_valid {
        return Ok(PdfSignatureResult {
            is_valid: false,
            public_key_der_hash: Vec::new(),
        });
    }

    // Build SPKI DER and hash it
    let spki_der = build_spki_der(&params)?;
    let spki_hash = sha256_hash(&spki_der);

    Ok(PdfSignatureResult {
        is_valid: true,
        public_key_der_hash: spki_hash,
    })
}

/// SHA-256 hash using OpenVM accelerator when available
#[inline]
fn sha256_hash(data: &[u8]) -> Vec<u8> {
    #[cfg(feature = "openvm_accel")]
    {
        openvm_sha256_crate::sha256(data).to_vec()
    }
    #[cfg(not(feature = "openvm_accel"))]
    {
        Sha256::digest(data).to_vec()
    }
}

/// Build Subject Public Key Info (SPKI) DER from verifier params
fn build_spki_der(params: &VerifierParams) -> Result<Vec<u8>, String> {
    let modulus = BigInt::from_bytes_be(Sign::Plus, &params.modulus);
    let exponent = BigInt::from_bytes_be(Sign::Plus, &params.exponent.to_bytes_be());

    // RSA public key sequence
    let rsa_seq = ASN1Block::Sequence(
        0,
        vec![
            ASN1Block::Integer(0, modulus),
            ASN1Block::Integer(0, exponent),
        ],
    );
    let rsa_der = to_der(&rsa_seq).map_err(|e| e.to_string())?;

    // Algorithm identifier (rsaEncryption OID + NULL)
    let alg_seq = ASN1Block::Sequence(
        0,
        vec![
            ASN1Block::ObjectIdentifier(0, oid!(1, 2, 840, 113549, 1, 1, 1)),
            ASN1Block::Null(0),
        ],
    );
    let alg_der = to_der(&alg_seq).map_err(|e| e.to_string())?;

    // Wrap RSA key in BIT STRING (with 0 unused bits prefix)
    let mut bitstring = vec![0x03];
    append_der_length(&mut bitstring, rsa_der.len() + 1);
    bitstring.push(0x00); // unused bits
    bitstring.extend_from_slice(&rsa_der);

    // SPKI = SEQUENCE { algorithm, subjectPublicKey }
    let mut spki_body = Vec::new();
    spki_body.extend_from_slice(&alg_der);
    spki_body.extend_from_slice(&bitstring);

    let mut spki = vec![0x30];
    append_der_length(&mut spki, spki_body.len());
    spki.extend_from_slice(&spki_body);

    Ok(spki)
}

#[inline]
fn append_der_length(buf: &mut Vec<u8>, len: usize) {
    if len < 128 {
        buf.push(len as u8);
    } else {
        let mut bytes = Vec::new();
        let mut val = len;
        while val > 0 {
            bytes.push((val & 0xFF) as u8);
            val >>= 8;
        }
        buf.push(0x80 | bytes.len() as u8);
        for b in bytes.into_iter().rev() {
            buf.push(b);
        }
    }
}
