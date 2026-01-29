use std::str;

fn parse_byte_range(pdf_bytes: &[u8]) -> Result<(Vec<u8>, usize), &'static str> {
    let br_pos = pdf_bytes
        .windows(b"/ByteRange".len())
        .position(|w| w == b"/ByteRange")
        .ok_or("ByteRange not found")?;
    let br_start = pdf_bytes[br_pos..]
        .iter()
        .position(|&b| b == b'[')
        .ok_or("ByteRange '[' not found")?
        + br_pos
        + 1;
    let br_end = pdf_bytes[br_start..]
        .iter()
        .position(|&b| b == b']')
        .ok_or("ByteRange ']' not found")?
        + br_start;
    let br_str =
        str::from_utf8(&pdf_bytes[br_start..br_end]).map_err(|_| "Invalid ByteRange data")?;

    let nums: Vec<usize> = br_str
        .split_whitespace()
        .filter_map(|s| s.parse().ok())
        .take(4)
        .collect();
    if nums.len() != 4 {
        return Err("Expected exactly 4 numbers inside ByteRange");
    }
    let [offset1, len1, offset2, len2] = [nums[0], nums[1], nums[2], nums[3]];

    if offset1 + len1 > pdf_bytes.len() || offset2 + len2 > pdf_bytes.len() {
        return Err("ByteRange values out of bounds");
    }

    let mut contents_pos = pdf_bytes[..br_pos]
        .windows(b"/Contents".len())
        .rposition(|w| w == b"/Contents");
    if contents_pos.is_none() {
        contents_pos = pdf_bytes[br_pos..]
            .windows(b"/Contents".len())
            .position(|w| w == b"/Contents")
            .map(|pos| pos + br_pos);
    }
    let contents_pos = contents_pos.ok_or("Contents not found near ByteRange")?;

    let mut signed_bytes = Vec::with_capacity(len1 + len2);
    signed_bytes.extend_from_slice(&pdf_bytes[offset1..offset1 + len1]);
    signed_bytes.extend_from_slice(&pdf_bytes[offset2..offset2 + len2]);

    Ok((signed_bytes, contents_pos))
}

fn extract_signature_hex(pdf_bytes: &[u8], contents_pos: usize) -> Result<String, &'static str> {
    let contents_slice = &pdf_bytes[contents_pos..];
    if let Some(hex_str) = extract_inline_contents_hex(contents_slice)? {
        return Ok(hex_str);
    }

    extract_indirect_contents_hex(pdf_bytes, contents_slice)
}

fn extract_inline_contents_hex(contents_slice: &[u8]) -> Result<Option<String>, &'static str> {
    if let Some(start) = contents_slice.iter().position(|&b| b == b'<') {
        let mut end_offset = None;
        for (idx, ch) in contents_slice[start + 1..].iter().enumerate() {
            match *ch {
                b'>' => {
                    end_offset = Some(idx + start + 1);
                    break;
                }
                b'0'..=b'9' | b'a'..=b'f' | b'A'..=b'F' => continue,
                b' ' | b'\t' | b'\r' | b'\n' => continue,
                _ => {
                    return Err("Invalid character in Contents hex");
                }
            }
        }

        let end = end_offset.ok_or("End '>' not found after Contents")?;
        let hex_slice = &contents_slice[start + 1..end];
        let clean = hex_slice
            .iter()
            .filter(|&&c| !c.is_ascii_whitespace())
            .cloned()
            .collect::<Vec<u8>>();
        let hex_str = str::from_utf8(&clean).map_err(|_| "Invalid hex in Contents")?;
        if hex_str.is_empty() {
            return Err("Empty Contents hex");
        }
        return Ok(Some(hex_str.to_string()));
    }
    Ok(None)
}

fn extract_indirect_contents_hex(
    pdf_bytes: &[u8],
    contents_slice: &[u8],
) -> Result<String, &'static str> {
    let reference_start = contents_slice
        .iter()
        .position(|&b| b.is_ascii_digit())
        .ok_or("Contents reference missing object number")?;
    let reference_end = contents_slice[reference_start..]
        .iter()
        .position(|&b| b == b'R')
        .map(|idx| reference_start + idx + 1)
        .ok_or("Contents reference missing 'R'")?;
    let reference = str::from_utf8(&contents_slice[reference_start..reference_end])
        .map_err(|_| "Invalid Contents reference")?;
    let mut parts = reference.split_whitespace();
    let obj_num = parts
        .next()
        .and_then(|p| p.parse::<usize>().ok())
        .ok_or("Invalid Contents object number")?;
    let gen_num = parts
        .next()
        .and_then(|p| p.parse::<usize>().ok())
        .ok_or("Invalid Contents generation number")?;

    let pattern = format!("{} {} obj", obj_num, gen_num).into_bytes();
    let obj_pos = pdf_bytes
        .windows(pattern.len())
        .position(|w| w == pattern)
        .ok_or("Contents object not found")?;

    let stream_start = pdf_bytes[obj_pos..]
        .windows(b"stream".len())
        .position(|w| w == b"stream")
        .ok_or("stream keyword not found in Contents object")?
        + obj_pos
        + b"stream".len();
    let stream_end = pdf_bytes[stream_start..]
        .windows(b"endstream".len())
        .position(|w| w == b"endstream")
        .ok_or("endstream not found in Contents object")?
        + stream_start;

    let hex_slice = pdf_bytes[stream_start..stream_end]
        .iter()
        .skip_while(|&&c| c.is_ascii_whitespace())
        .cloned()
        .collect::<Vec<u8>>();
    let hex_slice = hex_slice
        .iter()
        .rev()
        .skip_while(|&&c| c.is_ascii_whitespace())
        .cloned()
        .collect::<Vec<u8>>();
    let hex_slice: Vec<u8> = hex_slice.into_iter().rev().collect();
    let clean_hex: String = hex_slice
        .iter()
        .filter(|&&c| !c.is_ascii_whitespace())
        .map(|&c| c as char)
        .collect();

    if clean_hex.is_empty() {
        return Err("Empty contents stream");
    }

    Ok(clean_hex)
}

fn decode_signature_hex(hex_str: &str) -> Result<Vec<u8>, &'static str> {
    let clean_hex: String = hex_str.chars().filter(|c| !c.is_whitespace()).collect();
    let mut signature_der = hex::decode(clean_hex).map_err(|_| "Contents hex parse error")?;
    while signature_der.last() == Some(&0) {
        signature_der.pop();
    }
    Ok(signature_der)
}

pub fn get_signature_der(pdf_bytes: &[u8]) -> Result<(Vec<u8>, Vec<u8>), &'static str> {
    let (signed_bytes, contents_pos) = parse_byte_range(pdf_bytes)?;
    let hex_str = extract_signature_hex(pdf_bytes, contents_pos)?;
    let signature_der = decode_signature_hex(&hex_str)?;

    Ok((signature_der, signed_bytes))
}
