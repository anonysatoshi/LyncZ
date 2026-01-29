use crate::cmap::parse_cmap;
use crate::handle_stream_filters;
use crate::types::PdfObj;
use std::collections::HashMap;

// Use the existing PdfFont from types module
use crate::types::PdfFont;

pub fn collect_fonts(
    resources: &HashMap<String, PdfObj>,
    objects: &HashMap<(u32, u16), PdfObj>,
    decompress: bool,
) -> Result<HashMap<String, PdfFont>, crate::types::PdfError> {
    let mut fonts = HashMap::new();

    if let Some(PdfObj::Dictionary(font_dict)) = resources.get("Font") {
        for (name, font_obj) in font_dict {
            if let PdfObj::Reference(font_ref) = font_obj {
                if let Some(PdfObj::Dictionary(font_dic)) = objects.get(font_ref) {
                    let base_name = font_dic.get("BaseFont").and_then(|obj| match obj {
                        PdfObj::Name(n) => Some(n.clone()),
                        _ => None,
                    });

                    let subtype = font_dic.get("Subtype").and_then(|obj| match obj {
                        PdfObj::Name(n) => Some(n.clone()),
                        _ => None,
                    });

                    let mut encoding_name: Option<String> = None;
                    let mut differences_map: Option<HashMap<u32, String>> = None;

                    if let Some(encoding_obj) = font_dic.get("Encoding") {
                        match encoding_obj {
                            PdfObj::Name(enc_name) => {
                                encoding_name = Some(enc_name.clone());
                            }
                            PdfObj::Dictionary(enc_dict) => {
                                if let Some(PdfObj::Name(base_enc)) = enc_dict.get("BaseEncoding") {
                                    encoding_name = Some(base_enc.clone());
                                }
                                if let Some(PdfObj::Array(diffs)) = enc_dict.get("Differences") {
                                    let mut diff_map = HashMap::new();
                                    let mut current_code = 0;
                                    for diff in diffs {
                                        match diff {
                                            PdfObj::Number(code) => {
                                                current_code = *code as u32;
                                            }
                                            PdfObj::Name(name) => {
                                                diff_map.insert(current_code, name.clone());
                                                current_code += 1;
                                            }
                                            _ => {}
                                        }
                                    }
                                    if !diff_map.is_empty() {
                                        differences_map = Some(diff_map);
                                    }
                                }
                            }
                            _ => {}
                        }
                    }

                    // Enhanced ToUnicode CMap extraction with better error handling
                    let mut to_uni_map: Option<HashMap<u32, String>> = None;
                    if let Some(PdfObj::Reference(tu_ref)) = font_dic.get("ToUnicode") {
                        if let Some(PdfObj::Stream(tu_stream)) = objects.get(tu_ref) {
                            let cmap_bytes = if let Some(filter) = tu_stream.dict.get("Filter") {
                                let mut temp_vecs: Vec<Vec<u8>> = Vec::new();
                                match handle_stream_filters(
                                    filter,
                                    &tu_stream.data,
                                    decompress,
                                    &mut temp_vecs,
                                ) {
                                    Ok(_) => {
                                        if !temp_vecs.is_empty() {
                                            temp_vecs.remove(0)
                                        } else {
                                            tu_stream.data.clone()
                                        }
                                    }
                                    Err(_) => tu_stream.data.clone(),
                                }
                            } else {
                                tu_stream.data.clone()
                            };

                            to_uni_map = Some(parse_cmap(&cmap_bytes));
                        }
                    }

                    let pdf_font = PdfFont {
                        base_name,
                        subtype,
                        encoding: encoding_name,
                        to_unicode_map: to_uni_map.map(|m| m.into_iter().collect()),
                        differences: differences_map,
                    };

                    fonts.insert(name.clone(), pdf_font);
                }
            }
        }
    }

    Ok(fonts)
}
