use num_bigint::BigUint;

#[cfg(feature = "openvm_accel")]
use openvm_sha2 as openvm_sha256_crate;

#[cfg(not(feature = "openvm_accel"))]
use sha2::{Digest, Sha256};

use simple_asn1::{from_der, oid, ASN1Block, ASN1Class};

/// Minimal verifier params - only what's needed for Alipay PDF verification
pub struct VerifierParams {
    pub modulus: Vec<u8>,
    pub exponent: BigUint,
    pub signature: Vec<u8>,
    pub signed_attr_digest: Vec<u8>,
    pub signed_data_message_digest: Vec<u8>,
}

/// Parse PKCS#7 SignedData and extract verification parameters
pub fn parse_signed_data(der_bytes: &[u8]) -> Result<VerifierParams, String> {
    let blocks = from_der(der_bytes).map_err(|e| format!("DER parse error: {}", e))?;

    let content_info = extract_content_info(&blocks)?;
    let signed_children = extract_signed_children(content_info)?;
    
    // Extract signer info
    let signer_info = extract_signer_info(&signed_children)?;
    let (signer_serial, digest_oid) = extract_issuer_and_digest(&signer_info)?;
    
    // Get signed attributes and compute digest
    let signed_attrs_der = extract_signed_attributes_der(signer_info)?;
    let signed_attr_digest = compute_sha256_digest(&signed_attrs_der, &digest_oid)?;
    
    // Extract message digest from signed attributes
    let signed_attrs = from_der(&signed_attrs_der)
        .map_err(|e| format!("signedAttrs parse error: {}", e))?;
    let message_digest = extract_message_digest(&signed_attrs)?;
    
    // Extract signature
    let signature = extract_signature(signer_info, &signed_attr_digest)?;
    
    // Extract public key components
    let (modulus, exponent) = extract_pubkey_components(&signed_children, &signer_serial)?;

    Ok(VerifierParams {
        modulus,
        exponent,
        signature,
        signed_attr_digest,
        signed_data_message_digest: message_digest,
    })
}

/// Compute SHA-256 digest (Alipay uses SHA-256)
fn compute_sha256_digest(data: &[u8], digest_oid: &simple_asn1::OID) -> Result<Vec<u8>, String> {
    // Verify it's SHA-256 OID
    if *digest_oid != oid!(2, 16, 840, 1, 101, 3, 4, 2, 1) {
        return Err("Only SHA-256 is supported for Alipay PDFs".into());
    }
    
    #[cfg(feature = "openvm_accel")]
    {
        Ok(openvm_sha256_crate::sha256(data).to_vec())
    }
    #[cfg(not(feature = "openvm_accel"))]
    {
        Ok(Sha256::digest(data).to_vec())
    }
}

fn extract_signer_info(signed_data_seq: &[ASN1Block]) -> Result<&Vec<ASN1Block>, String> {
    match signed_data_seq.last() {
        Some(ASN1Block::Set(_, items)) => match items.first() {
            Some(ASN1Block::Sequence(_, signer_info)) => Ok(signer_info),
            _ => Err("Expected SignerInfo SEQUENCE".into()),
        },
        _ => Err("Expected SignerInfo SET".into()),
    }
}

fn extract_issuer_and_digest(signer_info: &[ASN1Block]) -> Result<(BigUint, simple_asn1::OID), String> {
    // issuerAndSerialNumber
    let signer_serial = match &signer_info[1] {
        ASN1Block::Sequence(_, parts) if parts.len() == 2 => {
            match &parts[1] {
                ASN1Block::Integer(_, big_int) => {
                    BigUint::from_bytes_be(&big_int.to_signed_bytes_be())
                }
                _ => return Err("Expected serialNumber INTEGER".into()),
            }
        }
        _ => return Err("Expected issuerAndSerialNumber SEQUENCE".into()),
    };

    // digestAlgorithm
    let digest_oid = match &signer_info[2] {
        ASN1Block::Sequence(_, items) => {
            match &items[0] {
                ASN1Block::ObjectIdentifier(_, oid) => oid.clone(),
                _ => return Err("Invalid digestAlgorithm".into()),
            }
        }
        _ => return Err("Digest algorithm missing".into()),
    };

    Ok((signer_serial, digest_oid))
}

fn extract_signed_attributes_der(signer_info: &[ASN1Block]) -> Result<Vec<u8>, String> {
    for block in signer_info {
        if let ASN1Block::Unknown(ASN1Class::ContextSpecific, true, _len, tag_no, content) = block {
            if tag_no == &BigUint::from(0u8) {
                let mut out = Vec::with_capacity(content.len() + 4);
                out.push(0x31); // SET tag

                let len = content.len();
                if len < 128 {
                    out.push(len as u8);
                } else if len <= 0xFF {
                    out.push(0x81);
                    out.push(len as u8);
                } else {
                    out.push(0x82);
                    out.push((len >> 8) as u8);
                    out.push((len & 0xFF) as u8);
                }

                out.extend_from_slice(content);
                return Ok(out);
            }
        }
    }
    Err("signedAttrs [0] not found".into())
}

fn extract_signature(signer_info: &[ASN1Block], digest_bytes: &[u8]) -> Result<Vec<u8>, String> {
    let sig_index = if digest_bytes.is_empty() { 4 } else { 5 };
    match signer_info.get(sig_index) {
        Some(ASN1Block::OctetString(_, s)) => Ok(s.clone()),
        _ => Err("Signature not found".into()),
    }
}

fn extract_content_info(blocks: &[ASN1Block]) -> Result<&[ASN1Block], String> {
    match blocks.first() {
        Some(ASN1Block::Sequence(_, children)) => {
            match &children[0] {
                ASN1Block::ObjectIdentifier(_, oid_val) 
                    if *oid_val == oid!(1, 2, 840, 113549, 1, 7, 2) => Ok(children),
                _ => Err("Not a SignedData contentType".into()),
            }
        }
        _ => Err("Top-level not a SEQUENCE".into()),
    }
}

fn extract_signed_children(children: &[ASN1Block]) -> Result<Vec<ASN1Block>, String> {
    let block = children.get(1).ok_or("Missing SignedData content")?;

    match block {
        ASN1Block::Explicit(ASN1Class::ContextSpecific, _, _, inner) => {
            match &**inner {
                ASN1Block::Sequence(_, seq) => Ok(seq.clone()),
                _ => Err("Explicit SignedData not a SEQUENCE".into()),
            }
        }
        ASN1Block::Unknown(ASN1Class::ContextSpecific, _, _, _, data) => {
            let parsed = from_der(data).map_err(|e| format!("Parse error: {}", e))?;
            match parsed.first() {
                Some(ASN1Block::Sequence(_, seq)) => Ok(seq.clone()),
                _ => Err("Inner SignedData not a SEQUENCE".into()),
            }
        }
        ASN1Block::Sequence(_, seq) => Ok(seq.clone()),
        _ => Err("Unexpected SignedData format".into()),
    }
}

fn extract_pubkey_components(
    signed_data_seq: &[ASN1Block],
    signer_serial: &BigUint,
) -> Result<(Vec<u8>, BigUint), String> {
    let certificates = find_certificates(signed_data_seq)?;
    let tbs_fields = get_tbs_for_serial(&certificates, signer_serial)?;
    let spki_fields = find_spki(&tbs_fields)?;
    let bitstring = extract_pubkey_bitstring(spki_fields)?;
    let rsa_seq = parse_rsa_pubkey(&bitstring)?;
    
    let modulus = match &rsa_seq[0] {
        ASN1Block::Integer(_, m) => m.to_signed_bytes_be(),
        _ => return Err("Modulus not found".into()),
    };
    
    let exponent = match &rsa_seq[1] {
        ASN1Block::Integer(_, e) => BigUint::from_bytes_be(&e.to_signed_bytes_be()),
        _ => return Err("Exponent not found".into()),
    };

    Ok((modulus, exponent))
}

fn find_certificates(signed_data_seq: &[ASN1Block]) -> Result<Vec<ASN1Block>, String> {
    let certs_block = signed_data_seq.iter().find(|block| {
        matches!(block,
            ASN1Block::Explicit(ASN1Class::ContextSpecific, _, tag, _) |
            ASN1Block::Unknown(ASN1Class::ContextSpecific, _, _, tag, _)
            if tag == &BigUint::from(0u8)
        )
    });

    match certs_block {
        Some(ASN1Block::Unknown(ASN1Class::ContextSpecific, _, _, _, data)) => {
            let parsed = from_der(data).map_err(|e| format!("Cert parse error: {}", e))?;
            match parsed.as_slice() {
                [ASN1Block::Set(_, items)] | [ASN1Block::Sequence(_, items)] => Ok(items.clone()),
                seqs if seqs.iter().all(|b| matches!(b, ASN1Block::Sequence(_, _))) => {
                    Ok(seqs.to_vec())
                }
                _ => Err("Unexpected certificate structure".into()),
            }
        }
        Some(ASN1Block::Explicit(ASN1Class::ContextSpecific, _, _, inner)) => {
            match inner.as_ref() {
                ASN1Block::Set(_, certs) => Ok(certs.clone()),
                ASN1Block::Sequence(tag, fields) => Ok(vec![ASN1Block::Sequence(*tag, fields.clone())]),
                _ => Err("Unexpected explicit cert block".into()),
            }
        }
        _ => Ok(Vec::new()),
    }
}

fn get_tbs_for_serial(
    certificates: &[ASN1Block],
    target_serial: &BigUint,
) -> Result<Vec<ASN1Block>, String> {
    for cert in certificates {
        let fields = match cert {
            ASN1Block::Sequence(_, f) => f,
            _ => continue,
        };

        let tbs = match &fields[0] {
            ASN1Block::Explicit(ASN1Class::ContextSpecific, _, _, _) => fields.clone(),
            ASN1Block::Sequence(_, seq) => seq.clone(),
            _ => continue,
        };

        let serial = match &tbs[1] {
            ASN1Block::Integer(_, big_int) => BigUint::from_bytes_be(&big_int.to_signed_bytes_be()),
            _ => continue,
        };

        if serial == *target_serial {
            return Ok(tbs);
        }
    }
    Err("No matching certificate found".into())
}

fn find_spki(tbs_fields: &[ASN1Block]) -> Result<&Vec<ASN1Block>, String> {
    tbs_fields.iter().find_map(|b| {
        if let ASN1Block::Sequence(_, sf) = b {
            if let Some(ASN1Block::Sequence(_, alg)) = sf.first() {
                if let Some(ASN1Block::ObjectIdentifier(_, o)) = alg.first() {
                    if *o == oid!(1, 2, 840, 113549, 1, 1, 1) {
                        return Some(sf);
                    }
                }
            }
        }
        None
    }).ok_or_else(|| "subjectPublicKeyInfo not found".into())
}

fn extract_pubkey_bitstring(spki: &[ASN1Block]) -> Result<Vec<u8>, String> {
    match spki.get(1) {
        Some(ASN1Block::BitString(_, _, d)) => Ok(d.clone()),
        _ => Err("Expected BIT STRING for public key".into()),
    }
}

fn parse_rsa_pubkey(bitstring: &[u8]) -> Result<Vec<ASN1Block>, String> {
    let blocks = from_der(bitstring).map_err(|e| format!("RSA key parse error: {}", e))?;
    match blocks.first() {
        Some(ASN1Block::Sequence(_, items)) => Ok(items.clone()),
        _ => Err("RSA key not a SEQUENCE".into()),
    }
}

fn extract_message_digest(attrs: &[ASN1Block]) -> Result<Vec<u8>, String> {
    let candidates = match attrs.first() {
        Some(ASN1Block::Set(_, inner)) if attrs.len() == 1 => inner.as_slice(),
        _ => attrs,
    };

    for attr in candidates {
        if let ASN1Block::Sequence(_, items) = attr {
            if let Some(ASN1Block::ObjectIdentifier(_, oid)) = items.first() {
                if *oid == oid!(1, 2, 840, 113549, 1, 9, 4) {
                    if let Some(ASN1Block::Set(_, inner)) = items.get(1) {
                        if let Some(ASN1Block::OctetString(_, data)) = inner.first() {
                            return Ok(data.clone());
                        }
                    }
                }
            }
        }
    }
    Err("messageDigest not found".into())
}
