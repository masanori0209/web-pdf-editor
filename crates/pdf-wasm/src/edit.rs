use crate::{TextAnnotation, TextInsertion};
use harumi::{Document, FontHandle};
use wasm_bindgen::prelude::*;

fn js_err(err: impl ToString) -> JsValue {
    JsValue::from_str(&err.to_string())
}

fn parse_hex_color(hex: &str) -> Result<[f32; 3], JsValue> {
    let normalized = hex.trim_start_matches('#');
    let value = if normalized.len() == 3 {
        normalized
            .chars()
            .flat_map(|c| std::iter::repeat(c).take(2))
            .collect::<String>()
    } else {
        normalized.to_string()
    };

    if value.len() != 6 {
        return Err(js_err(format!("Invalid color: {hex}")));
    }

    let r = u8::from_str_radix(&value[0..2], 16).map_err(|e| js_err(e))? as f32 / 255.0;
    let g = u8::from_str_radix(&value[2..4], 16).map_err(|e| js_err(e))? as f32 / 255.0;
    let b = u8::from_str_radix(&value[4..6], 16).map_err(|e| js_err(e))? as f32 / 255.0;
    Ok([r, g, b])
}

fn screen_to_pdf_y(page_height: f32, screen_y: f32, font_size: f32) -> f32 {
    page_height - screen_y - font_size
}

fn estimate_text_width(text: &str, font_size: f32, font_family: &str) -> f32 {
    let char_width = if font_family == "Noto Sans JP" || text.chars().any(|c| c as u32 > 127) {
        1.0
    } else {
        0.55
    };
    (text.chars().count() as f32 * font_size * char_width).max(40.0)
}

pub fn build_edited_pdf(
    original_bytes: &[u8],
    annotations: &[TextAnnotation],
    insertions: &[TextInsertion],
    font_bytes: &[u8],
) -> Result<Vec<u8>, JsValue> {
    if annotations.is_empty() && insertions.is_empty() {
        return Ok(original_bytes.to_vec());
    }

    let mut document = Document::from_bytes(original_bytes).map_err(|e| js_err(e))?;
    let font = document.embed_font(font_bytes).map_err(|e| js_err(e))?;

    for annotation in annotations {
        apply_annotation(&mut document, font, annotation)?;
    }

    for insertion in insertions {
        apply_insertion(&mut document, font, insertion)?;
    }

    document.save_to_bytes().map_err(|e| js_err(e))
}

fn apply_annotation(
    document: &mut Document,
    font: FontHandle,
    annotation: &TextAnnotation,
) -> Result<(), JsValue> {
    let mut page = document
        .page(annotation.page.max(1) as u32)
        .map_err(|e| js_err(e))?;
    let (_, page_height) = page.size().map_err(|e| js_err(e))?;

    let font_size = annotation.font_size;
    let pdf_y = screen_to_pdf_y(page_height, annotation.y, font_size);
    let text_width = estimate_text_width(
        &annotation.text,
        font_size,
        &annotation.font_family,
    );
    let rect_width = text_width + 8.0;
    let rect_height = font_size + 8.0;
    let left = annotation.x - 4.0;
    let bottom = pdf_y - 4.0;
    let color = parse_hex_color(&annotation.color)?;

    page.add_rect([left, bottom, rect_width, rect_height], [1.0, 0.95, 0.6], 0.85)
        .map_err(|e| js_err(e))?;
    page.add_text(
        &annotation.text,
        font,
        [annotation.x, pdf_y],
        font_size,
        color,
    )
    .map_err(|e| js_err(e))?;

    Ok(())
}

fn apply_insertion(
    document: &mut Document,
    font: FontHandle,
    insertion: &TextInsertion,
) -> Result<(), JsValue> {
    let mut page = document
        .page(insertion.page.max(1) as u32)
        .map_err(|e| js_err(e))?;
    let (_, page_height) = page.size().map_err(|e| js_err(e))?;
    let pdf_y = screen_to_pdf_y(page_height, insertion.y, insertion.font_size);
    let color = parse_hex_color(&insertion.color)?;

    page.add_text(
        &insertion.text,
        font,
        [insertion.x, pdf_y],
        insertion.font_size,
        color,
    )
    .map_err(|e| js_err(e))?;

    Ok(())
}
