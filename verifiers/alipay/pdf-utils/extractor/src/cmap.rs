use crate::types::PdfFont;
use std::collections::{BTreeMap, HashMap};

// Enhanced CMap parsing with better error handling
pub fn parse_cmap(cmap_data: &[u8]) -> HashMap<u32, String> {
    let mut map = BTreeMap::new();
    let text = String::from_utf8_lossy(cmap_data).into_owned();

    let lines: Vec<&str> = text.lines().collect();
    let mut i = 0;
    while i < lines.len() {
        let line = lines[i].trim();

        if line.contains("beginbfchar") {
            i += 1;
            while i < lines.len() && !lines[i].trim_end().ends_with("endbfchar") {
                let l = lines[i].trim();
                if l.starts_with('<') {
                    let parts: Vec<&str> = l.split_ascii_whitespace().collect();
                    if parts.len() >= 2 {
                        let src = parts[0].trim_matches(|c| c == '<' || c == '>');
                        let dst = parts[1].trim_matches(|c| c == '<' || c == '>');
                        if let Ok(src_code) = u32::from_str_radix(src, 16) {
                            if let Some(dst_str) = parse_cmap_hex_to_string(dst) {
                                map.insert(src_code, dst_str);
                            }
                        }
                    }
                }
                i += 1;
            }
        } else if line.contains("beginbfrange") {
            i += 1;
            while i < lines.len() && !lines[i].trim_end().ends_with("endbfrange") {
                let l = lines[i].trim();
                if l.starts_with('<') {
                    // Enhanced splitting that handles bfrange format properly
                    let mut parts = Vec::new();
                    let mut current_part = String::new();
                    let mut in_brackets = false;

                    for ch in l.chars() {
                        if ch == '<' {
                            if !current_part.is_empty() {
                                parts.push(current_part.clone());
                                current_part.clear();
                            }
                            in_brackets = true;
                            current_part.push(ch);
                        } else if ch == '>' {
                            current_part.push(ch);
                            in_brackets = false;
                            parts.push(current_part.clone());
                            current_part.clear();
                        } else if in_brackets {
                            current_part.push(ch);
                        } else if !ch.is_whitespace() {
                            current_part.push(ch);
                        } else if !current_part.is_empty() {
                            parts.push(current_part.clone());
                            current_part.clear();
                        }
                    }

                    if !current_part.is_empty() {
                        parts.push(current_part);
                    }

                    if parts.len() >= 3 {
                        let start_hex = parts[0].trim_matches(|c| c == '<' || c == '>');
                        let end_hex = parts[1].trim_matches(|c| c == '<' || c == '>');
                        if let (Ok(start_code), Ok(end_code)) = (
                            u32::from_str_radix(start_hex, 16),
                            u32::from_str_radix(end_hex, 16),
                        ) {
                            if parts[2].starts_with('[') {
                                // Array-based range mapping
                                let mut j = 2;
                                let mut cur_code = start_code;
                                let mut array_str = String::new();
                                while j < parts.len() {
                                    array_str.push_str(&parts[j]);
                                    array_str.push(' ');
                                    if parts[j].ends_with(']') {
                                        break;
                                    }
                                    j += 1;
                                }
                                array_str = array_str
                                    .trim()
                                    .trim_start_matches('[')
                                    .trim_end_matches(']')
                                    .trim()
                                    .to_string();
                                let dests: Vec<&str> = array_str.split_ascii_whitespace().collect();
                                for dest_hex in dests {
                                    let dst = dest_hex.trim_matches(|c| c == '<' || c == '>');
                                    if let Some(dst_str) = parse_cmap_hex_to_string(dst) {
                                        map.insert(cur_code, dst_str);
                                    }
                                    cur_code += 1;
                                }
                            } else {
                                // Range mapping with start offset
                                let dest_start_hex =
                                    parts[2].trim_matches(|c| c == '<' || c == '>');
                                if let Some(dest_start_str) =
                                    parse_cmap_hex_to_string(dest_start_hex)
                                {
                                    let mut dest_start_codes: Vec<u32> =
                                        dest_start_str.chars().map(|ch| ch as u32).collect();
                                    for code in start_code..=end_code {
                                        let dest_string: String = dest_start_codes
                                            .iter()
                                            .map(|&u| char::from_u32(u).unwrap_or('�'))
                                            .collect();
                                        map.insert(code, dest_string);
                                        if let Some(last) = dest_start_codes.last_mut() {
                                            *last += 1;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                i += 1;
            }
        } else {
            i += 1;
        }
    }

    map.into_iter().collect()
}

// Enhanced hex to string conversion with better error handling
fn parse_cmap_hex_to_string(hex: &str) -> Option<String> {
    if hex.is_empty() {
        return Some(String::new());
    }

    // Handle different hex formats
    let clean_hex = hex.trim_matches(|c| c == '<' || c == '>');

    if clean_hex.len() % 4 != 0 {
        return None;
    }

    let chunks: Vec<&[u8]> = clean_hex.as_bytes().chunks(4).collect();
    let mut out = String::new();
    let mut i = 0;

    while i < chunks.len() {
        let chunk = chunks[i];
        if chunk.len() < 4 {
            break;
        }
        let part = match core::str::from_utf8(chunk) {
            Ok(s) => s,
            Err(_) => return None,
        };

        let code = match u16::from_str_radix(part, 16) {
            Ok(c) => c,
            Err(_) => return None,
        };

        // Handle UTF-16 surrogate pairs
        if (0xD800..=0xDBFF).contains(&code) {
            if i + 1 < chunks.len() {
                let next_part = match core::str::from_utf8(chunks[i + 1]) {
                    Ok(s) => s,
                    Err(_) => continue,
                };
                if let Ok(low) = u16::from_str_radix(next_part, 16) {
                    if (0xDC00..=0xDFFF).contains(&low) {
                        let combined =
                            0x10000 + (((code - 0xD800) as u32) << 10) + ((low - 0xDC00) as u32);
                        if let Some(ch) = char::from_u32(combined) {
                            out.push(ch);
                            i += 2;
                            continue;
                        }
                    }
                }
            }
            out.push('�');
            i += 1;
            continue;
        } else if (0xDC00..=0xDFFF).contains(&code) {
            out.push('�');
        } else if let Some(ch) = char::from_u32(code as u32) {
            out.push(ch);
        } else {
            out.push('�');
        }
        i += 1;
    }

    Some(out)
}

// Enhanced byte decoding with better CMap handling
pub fn cmap_decode_bytes(bytes: &[u8], cmap: &HashMap<u32, String>, is_cid: bool) -> String {
    let mut result = String::new();
    if is_cid {
        // For CID fonts, codes are typically 2-byte sequences.
        let mut i = 0;
        while i < bytes.len() {
            let code = if i + 1 < bytes.len() {
                ((bytes[i] as u32) << 8) | (bytes[i + 1] as u32)
            } else {
                bytes[i] as u32
            };
            i += 2;
            if let Some(txt) = cmap.get(&code) {
                result.push_str(txt);
            } else {
                // Enhanced fallback for unmapped codes
                if code < 128 {
                    result.push(code as u8 as char);
                } else {
                    result.push('�');
                }
            }
        }
    } else {
        for &b in bytes {
            if let Some(txt) = cmap.get(&(b as u32)) {
                result.push_str(txt);
            } else {
                // Enhanced fallback for unmapped codes
                if b < 128 {
                    result.push(b as char);
                } else {
                    result.push('�');
                }
            }
        }
    }
    result
}

// Decode bytes using font's ToUnicode CMap or base encoding
pub fn decode_bytes(bytes: &[u8], font: &PdfFont) -> String {
    if let Some(cmap) = &font.to_unicode_map {
        let is_cid = font.subtype.as_deref() == Some("Type0");
        return cmap_decode_bytes(bytes, cmap, is_cid);
    }

    base_encode_bytes(bytes, font)
}

// Base encoding for fonts without CMap
fn base_encode_bytes(bytes: &[u8], font: &PdfFont) -> String {
    let mut result = String::new();
    for &b in bytes {
        let ch = if font.subtype.as_deref() == Some("Type1") {
            standard_to_unicode(b)
        } else {
            if b < 128 {
                b as char
            } else {
                '�'
            }
        };

        if ch != '\0' && ch != '�' {
            result.push(ch);
        }
    }
    result
}

// Standard encoding for Type1 fonts
fn standard_to_unicode(b: u8) -> char {
    match b {
        0x20 => ' ',
        0x21 => '!',
        0x22 => '"',
        0x23 => '#',
        0x24 => '$',
        0x25 => '%',
        0x26 => '&',
        0x27 => '\'',
        0x28 => '(',
        0x29 => ')',
        0x2A => '*',
        0x2B => '+',
        0x2C => ',',
        0x2D => '-',
        0x2E => '.',
        0x2F => '/',
        0x30 => '0',
        0x31 => '1',
        0x32 => '2',
        0x33 => '3',
        0x34 => '4',
        0x35 => '5',
        0x36 => '6',
        0x37 => '7',
        0x38 => '8',
        0x39 => '9',
        0x3A => ':',
        0x3B => ';',
        0x3C => '<',
        0x3D => '=',
        0x3E => '>',
        0x3F => '?',
        0x40 => '@',
        0x41 => 'A',
        0x42 => 'B',
        0x43 => 'C',
        0x44 => 'D',
        0x45 => 'E',
        0x46 => 'F',
        0x47 => 'G',
        0x48 => 'H',
        0x49 => 'I',
        0x4A => 'J',
        0x4B => 'K',
        0x4C => 'L',
        0x4D => 'M',
        0x4E => 'N',
        0x4F => 'O',
        0x50 => 'P',
        0x51 => 'Q',
        0x52 => 'R',
        0x53 => 'S',
        0x54 => 'T',
        0x55 => 'U',
        0x56 => 'V',
        0x57 => 'W',
        0x58 => 'X',
        0x59 => 'Y',
        0x5A => 'Z',
        0x5B => '[',
        0x5C => '\\',
        0x5D => ']',
        0x5E => '^',
        0x5F => '_',
        0x60 => '`',
        0x61 => 'a',
        0x62 => 'b',
        0x63 => 'c',
        0x64 => 'd',
        0x65 => 'e',
        0x66 => 'f',
        0x67 => 'g',
        0x68 => 'h',
        0x69 => 'i',
        0x6A => 'j',
        0x6B => 'k',
        0x6C => 'l',
        0x6D => 'm',
        0x6E => 'n',
        0x6F => 'o',
        0x70 => 'p',
        0x71 => 'q',
        0x72 => 'r',
        0x73 => 's',
        0x74 => 't',
        0x75 => 'u',
        0x76 => 'v',
        0x77 => 'w',
        0x78 => 'x',
        0x79 => 'y',
        0x7A => 'z',
        0x7B => '{',
        0x7C => '|',
        0x7D => '}',
        0x7E => '~',
        0x80 => '€',
        0x81 => ' ',
        0x82 => '‚',
        0x83 => 'ƒ',
        0x84 => '„',
        0x85 => '…',
        0x86 => '†',
        0x87 => '‡',
        0x88 => 'ˆ',
        0x89 => '‰',
        0x8A => 'Š',
        0x8B => '‹',
        0x8C => 'Œ',
        0x8D => ' ',
        0x8E => 'Ž',
        0x8F => ' ',
        0x90 => ' ',
        0x91 => '\'',
        0x92 => '\'',
        0x93 => '"',
        0x94 => '"',
        0x95 => '•',
        0x96 => '–',
        0x97 => '—',
        0x98 => '˜',
        0x99 => '™',
        0x9A => 'š',
        0x9B => '›',
        0x9C => 'œ',
        0x9D => ' ',
        0x9E => 'ž',
        0x9F => 'Ÿ',
        0xA0 => ' ',
        0xA1 => '¡',
        0xA2 => '¢',
        0xA3 => '£',
        0xA4 => '¤',
        0xA5 => '¥',
        0xA6 => '¦',
        0xA7 => '§',
        0xA8 => '¨',
        0xA9 => '©',
        0xAA => 'ª',
        0xAB => '«',
        0xAC => '¬',
        0xAD => '­',
        0xAE => '®',
        0xAF => '¯',
        0xB0 => '°',
        0xB1 => '±',
        0xB2 => '²',
        0xB3 => '³',
        0xB4 => '´',
        0xB5 => 'µ',
        0xB6 => '¶',
        0xB7 => '·',
        0xB8 => '¸',
        0xB9 => '¹',
        0xBA => 'º',
        0xBB => '»',
        0xBC => '¼',
        0xBD => '½',
        0xBE => '¾',
        0xBF => '¿',
        0xC0 => 'À',
        0xC1 => 'Á',
        0xC2 => 'Â',
        0xC3 => 'Ã',
        0xC4 => 'Ä',
        0xC5 => 'Å',
        0xC6 => 'Æ',
        0xC7 => 'Ç',
        0xC8 => 'È',
        0xC9 => 'É',
        0xCA => 'Ê',
        0xCB => 'Ë',
        0xCC => 'Ì',
        0xCD => 'Í',
        0xCE => 'Î',
        0xCF => 'Ï',
        0xD0 => 'Ð',
        0xD1 => 'Ñ',
        0xD2 => 'Ò',
        0xD3 => 'Ó',
        0xD4 => 'Ô',
        0xD5 => 'Õ',
        0xD6 => 'Ö',
        0xD7 => '×',
        0xD8 => 'Ø',
        0xD9 => 'Ù',
        0xDA => 'Ú',
        0xDB => 'Û',
        0xDC => 'Ü',
        0xDD => 'Ý',
        0xDE => 'Þ',
        0xDF => 'ß',
        0xE0 => 'à',
        0xE1 => 'á',
        0xE2 => 'â',
        0xE3 => 'ã',
        0xE4 => 'ä',
        0xE5 => 'å',
        0xE6 => 'æ',
        0xE7 => 'ç',
        0xE8 => 'è',
        0xE9 => 'é',
        0xEA => 'ê',
        0xEB => 'ë',
        0xEC => 'ì',
        0xED => 'í',
        0xEE => 'î',
        0xEF => 'ï',
        0xF0 => 'ð',
        0xF1 => 'ñ',
        0xF2 => 'ò',
        0xF3 => 'ó',
        0xF4 => 'ô',
        0xF5 => 'õ',
        0xF6 => 'ö',
        0xF7 => '÷',
        0xF8 => 'ø',
        0xF9 => 'ù',
        0xFA => 'ú',
        0xFB => 'û',
        0xFC => 'ü',
        0xFD => 'ý',
        0xFE => 'þ',
        0xFF => 'ÿ',
        _ => '�',
    }
}
