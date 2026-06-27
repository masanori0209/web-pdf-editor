use crate::{EditObject, TextAnnotation, TextInsertion};
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
    edit_objects: &[EditObject],
    font_bytes: &[u8],
) -> Result<Vec<u8>, JsValue> {
    if annotations.is_empty() && insertions.is_empty() && edit_objects.is_empty() {
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

    for edit_object in edit_objects {
        apply_edit_object(&mut document, font, edit_object)?;
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

fn shape_rect(page_height: f32, edit_object: &EditObject) -> [f32; 4] {
    let x = edit_object.x.min(edit_object.x + edit_object.width);
    let y = edit_object.y.min(edit_object.y + edit_object.height);
    let width = edit_object.width.abs().max(1.0);
    let height = edit_object.height.abs().max(1.0);
    [x, page_height - y - height, width, height]
}

fn point_to_pdf(page_height: f32, x: f32, y: f32) -> [f32; 2] {
    [x, page_height - y]
}

fn line_points(page_height: f32, edit_object: &EditObject) -> ([f32; 2], [f32; 2]) {
    (
        point_to_pdf(page_height, edit_object.x, edit_object.y),
        point_to_pdf(
            page_height,
            edit_object.x + edit_object.width,
            edit_object.y + edit_object.height,
        ),
    )
}

fn apply_filled_and_stroked_rect(
    page: &mut harumi::PageHandle<'_>,
    rect: [f32; 4],
    fill_color: [f32; 3],
    stroke_color: [f32; 3],
    fill_enabled: bool,
    stroke_width: f32,
) -> Result<(), JsValue> {
    if fill_enabled {
        page.add_rect(rect, fill_color, 0.35).map_err(|e| js_err(e))?;
    }
    if stroke_width > 0.0 {
        page.add_rect_stroke(rect, stroke_color, stroke_width, 1.0)
            .map_err(|e| js_err(e))?;
    }
    Ok(())
}

fn apply_filled_and_stroked_ellipse(
    page: &mut harumi::PageHandle<'_>,
    rect: [f32; 4],
    fill_color: [f32; 3],
    stroke_color: [f32; 3],
    fill_enabled: bool,
    stroke_width: f32,
) -> Result<(), JsValue> {
    if fill_enabled {
        page.add_ellipse(rect, fill_color, 0.35, true, 0.0)
            .map_err(|e| js_err(e))?;
    }
    if stroke_width > 0.0 {
        page.add_ellipse(rect, stroke_color, 1.0, false, stroke_width)
            .map_err(|e| js_err(e))?;
    }
    Ok(())
}

fn arrow_head(from: [f32; 2], to: [f32; 2], size: f32) -> [[f32; 2]; 3] {
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    let len = (dx * dx + dy * dy).sqrt().max(1.0);
    let ux = dx / len;
    let uy = dy / len;
    let px = -uy;
    let py = ux;
    [
        to,
        [to[0] - ux * size + px * size * 0.55, to[1] - uy * size + py * size * 0.55],
        [to[0] - ux * size - px * size * 0.55, to[1] - uy * size - py * size * 0.55],
    ]
}

fn callout_points(rect: [f32; 4]) -> Vec<[f32; 2]> {
    let [x, y, width, height] = rect;
    let tail_width = width.min(48.0) * 0.35;
    let tail_x = x + width * 0.28;
    vec![
        [x, y],
        [tail_x, y],
        [tail_x + tail_width * 0.45, y - height.min(24.0) * 0.55],
        [tail_x + tail_width, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
    ]
}

fn apply_strike_through(
    page: &mut harumi::PageHandle<'_>,
    text: &str,
    x: f32,
    baseline_y: f32,
    font_size: f32,
    font_family: &str,
    color: [f32; 3],
) -> Result<(), JsValue> {
    let width = estimate_text_width(text, font_size, font_family);
    let y = baseline_y + font_size * 0.35;
    page.add_line([x, y], [x + width, y], color, (font_size * 0.07).max(1.0), 1.0)
        .map_err(|e| js_err(e))
}

fn apply_edit_object(
    document: &mut Document,
    font: FontHandle,
    edit_object: &EditObject,
) -> Result<(), JsValue> {
    let mut page = document
        .page(edit_object.page.max(1) as u32)
        .map_err(|e| js_err(e))?;
    let (_, page_height) = page.size().map_err(|e| js_err(e))?;
    let stroke_color = parse_hex_color(&edit_object.stroke_color)?;
    let fill_color = parse_hex_color(&edit_object.fill_color)?;
    let text_color = parse_hex_color(&edit_object.color)?;
    let stroke_width = edit_object.stroke_width.max(0.0);

    match edit_object.kind.as_str() {
        "rectangle" => {
            let rect = shape_rect(page_height, edit_object);
            apply_filled_and_stroked_rect(
                &mut page,
                rect,
                fill_color,
                stroke_color,
                edit_object.fill_enabled,
                stroke_width,
            )?;
        }
        "ellipse" => {
            let rect = shape_rect(page_height, edit_object);
            apply_filled_and_stroked_ellipse(
                &mut page,
                rect,
                fill_color,
                stroke_color,
                edit_object.fill_enabled,
                stroke_width,
            )?;
        }
        "line" => {
            let (from, to) = line_points(page_height, edit_object);
            page.add_line(from, to, stroke_color, stroke_width.max(1.0), 1.0)
                .map_err(|e| js_err(e))?;
        }
        "slash" => {
            let rect = shape_rect(page_height, edit_object);
            page.add_line(
                [rect[0], rect[1]],
                [rect[0] + rect[2], rect[1] + rect[3]],
                stroke_color,
                stroke_width.max(1.0),
                1.0,
            )
            .map_err(|e| js_err(e))?;
        }
        "arrow" => {
            let (from, to) = line_points(page_height, edit_object);
            page.add_line(from, to, stroke_color, stroke_width.max(1.0), 1.0)
                .map_err(|e| js_err(e))?;
            let head = arrow_head(from, to, 10.0 + stroke_width * 2.0);
            page.add_polygon(&head, stroke_color, 1.0, true, 0.0)
                .map_err(|e| js_err(e))?;
        }
        "callout" => {
            let rect = shape_rect(page_height, edit_object);
            let points = callout_points(rect);
            if edit_object.fill_enabled {
                page.add_polygon(&points, fill_color, 0.35, true, 0.0)
                    .map_err(|e| js_err(e))?;
            }
            if stroke_width > 0.0 {
                page.add_path(&points, true, stroke_color, false, stroke_width, 1.0)
                    .map_err(|e| js_err(e))?;
            }
            if !edit_object.text.trim().is_empty() {
                let text_x = rect[0] + 8.0;
                let text_y = rect[1] + rect[3] - edit_object.font_size - 8.0;
                page.add_text_styled(
                    &edit_object.text,
                    font,
                    [text_x, text_y],
                    edit_object.font_size,
                    text_color,
                    edit_object.bold,
                    edit_object.italic,
                )
                .map_err(|e| js_err(e))?;
                if edit_object.strike_through {
                    apply_strike_through(
                        &mut page,
                        &edit_object.text,
                        text_x,
                        text_y,
                        edit_object.font_size,
                        &edit_object.font_family,
                        text_color,
                    )?;
                }
            }
        }
        "text" => {
            let pdf_y = screen_to_pdf_y(page_height, edit_object.y, edit_object.font_size);
            page.add_text_styled(
                &edit_object.text,
                font,
                [edit_object.x, pdf_y],
                edit_object.font_size,
                text_color,
                edit_object.bold,
                edit_object.italic,
            )
            .map_err(|e| js_err(e))?;
            if edit_object.strike_through {
                apply_strike_through(
                    &mut page,
                    &edit_object.text,
                    edit_object.x,
                    pdf_y,
                    edit_object.font_size,
                    &edit_object.font_family,
                    text_color,
                )?;
            }
        }
        _ => {}
    }

    Ok(())
}
