mod edit;

use edit::build_edited_pdf;
use once_cell::sync::OnceCell;
use pdfium_render::prelude::*;
use serde::Serialize;
use std::cell::RefCell;
use wasm_bindgen::prelude::*;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct TextAnnotation {
    pub page: u16,
    pub x: f32,
    pub y: f32,
    pub text: String,
    pub font_size: f32,
    pub color: String,
    pub font_family: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct TextInsertion {
    pub page: u16,
    pub x: f32,
    pub y: f32,
    pub text: String,
    pub font_size: f32,
    pub color: String,
    pub font_family: String,
}

#[derive(Serialize)]
#[serde(rename_all = "snake_case")]
pub struct PdfInfo {
    pub page_count: u16,
    pub title: Option<String>,
    pub author: Option<String>,
    pub subject: Option<String>,
    pub creator: Option<String>,
    pub producer: Option<String>,
}

thread_local! {
    static JAPANESE_FONT: RefCell<Option<Vec<u8>>> = const { RefCell::new(None) };
}

pub fn set_japanese_font(data: Vec<u8>) {
    JAPANESE_FONT.with(|slot| {
        *slot.borrow_mut() = Some(data);
    });
}

fn font_bytes_or_err() -> Result<Vec<u8>, JsValue> {
    JAPANESE_FONT.with(|slot| {
        slot.borrow()
            .clone()
            .ok_or_else(|| js_err("日本語フォントが未設定です。set_japanese_font_bytes() を先に呼び出してください。"))
    })
}

pub fn pdfium() -> &'static Pdfium {
    static PDFIUM: OnceCell<Pdfium> = OnceCell::new();
    PDFIUM.get_or_init(Pdfium::default)
}

fn js_err(err: impl ToString) -> JsValue {
    JsValue::from_str(&err.to_string())
}

fn metadata_value(document: &PdfDocument, tag: PdfDocumentMetadataTagType) -> Option<String> {
    document
        .metadata()
        .get(tag)
        .map(|value| value.value().to_string())
}

pub fn load_info(bytes: &[u8]) -> Result<PdfInfo, JsValue> {
    let document = pdfium()
        .load_pdf_from_byte_slice(bytes, None)
        .map_err(js_err)?;

    Ok(PdfInfo {
        page_count: document.pages().len() as u16,
        title: metadata_value(&document, PdfDocumentMetadataTagType::Title),
        author: metadata_value(&document, PdfDocumentMetadataTagType::Author),
        subject: metadata_value(&document, PdfDocumentMetadataTagType::Subject),
        creator: metadata_value(&document, PdfDocumentMetadataTagType::Creator),
        producer: metadata_value(&document, PdfDocumentMetadataTagType::Producer),
    })
}

pub fn render_page(
    pdf_bytes: &[u8],
    page_index: u16,
    width: u32,
    height: u32,
) -> Result<web_sys::ImageData, JsValue> {
    let document = pdfium()
        .load_pdf_from_byte_slice(pdf_bytes, None)
        .map_err(js_err)?;

    let page = document
        .pages()
        .get(PdfPageIndex::from(page_index))
        .map_err(js_err)?;

    let bitmap = page
        .render_with_config(
            &PdfRenderConfig::new()
                .set_target_width(width as Pixels)
                .set_target_height(height as Pixels)
                .render_form_data(true),
        )
        .map_err(js_err)?;

    bitmap
        .as_image_data()
        .map_err(|_| js_err("ImageData conversion failed"))
}

#[wasm_bindgen]
pub struct WasmPdfProcessor {
    original_bytes: Vec<u8>,
    annotations: Vec<TextAnnotation>,
    text_insertions: Vec<TextInsertion>,
    modified: bool,
}

#[wasm_bindgen]
impl WasmPdfProcessor {
    #[wasm_bindgen(constructor)]
    pub fn new(data: &[u8]) -> Result<WasmPdfProcessor, JsValue> {
        if data.len() < 4 || &data[0..4] != b"%PDF" {
            return Err(js_err("有効なPDFファイルではありません。"));
        }

        Ok(WasmPdfProcessor {
            original_bytes: data.to_vec(),
            annotations: Vec::new(),
            text_insertions: Vec::new(),
            modified: false,
        })
    }

    pub fn is_valid_pdf(&self) -> bool {
        self.original_bytes.len() >= 4 && &self.original_bytes[0..4] == b"%PDF"
    }

    pub fn get_size(&self) -> usize {
        self.original_bytes.len()
    }

    pub fn get_info(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&load_info(&self.original_bytes)?).map_err(|e| js_err(e))
    }

    pub fn is_modified(&self) -> bool {
        self.modified
    }

    pub fn get_annotations(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.annotations).map_err(|e| js_err(e))
    }

    pub fn get_text_insertions(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.text_insertions).map_err(|e| js_err(e))
    }

    pub fn add_text_annotation(
        &mut self,
        page: u16,
        x: f32,
        y: f32,
        text: String,
        font_size: f32,
        color: String,
        font_family: String,
    ) {
        self.annotations.push(TextAnnotation {
            page,
            x,
            y,
            text,
            font_size,
            color,
            font_family,
        });
        self.modified = true;
    }

    pub fn add_text_insertion(
        &mut self,
        page: u16,
        x: f32,
        y: f32,
        text: String,
        font_size: f32,
        color: String,
        font_family: String,
    ) {
        self.text_insertions.push(TextInsertion {
            page,
            x,
            y,
            text,
            font_size,
            color,
            font_family,
        });
        self.modified = true;
    }

    pub fn remove_annotation(&mut self, index: usize) -> bool {
        if index >= self.annotations.len() {
            return false;
        }
        self.annotations.remove(index);
        self.modified = !self.annotations.is_empty() || !self.text_insertions.is_empty();
        true
    }

    pub fn remove_text_insertion(&mut self, index: usize) -> bool {
        if index >= self.text_insertions.len() {
            return false;
        }
        self.text_insertions.remove(index);
        self.modified = !self.annotations.is_empty() || !self.text_insertions.is_empty();
        true
    }

    pub fn clear_all_edits(&mut self) {
        self.annotations.clear();
        self.text_insertions.clear();
        self.modified = false;
    }

    pub fn generate_pdf_bytes(&self) -> Result<Vec<u8>, JsValue> {
        let font_bytes = font_bytes_or_err()?;
        build_edited_pdf(
            &self.original_bytes,
            &self.annotations,
            &self.text_insertions,
            &font_bytes,
        )
    }

    pub fn get_original_bytes(&self) -> Vec<u8> {
        self.original_bytes.clone()
    }
}

#[wasm_bindgen]
pub fn set_japanese_font_bytes(data: &[u8]) {
    set_japanese_font(data.to_vec());
}

#[wasm_bindgen]
pub fn wasm_get_page_dimensions(pdf_bytes: &[u8], page_index: u16) -> Result<JsValue, JsValue> {
    let document = pdfium()
        .load_pdf_from_byte_slice(pdf_bytes, None)
        .map_err(js_err)?;

    let page = document
        .pages()
        .get(PdfPageIndex::from(page_index))
        .map_err(js_err)?;

    #[derive(Serialize)]
    struct PageDimensions {
        width: f32,
        height: f32,
    }

    serde_wasm_bindgen::to_value(&PageDimensions {
        width: page.width().value,
        height: page.height().value,
    })
    .map_err(|error| js_err(error.to_string()))
}

#[wasm_bindgen]
pub fn wasm_render_page(
    pdf_bytes: &[u8],
    page_index: u16,
    width: u32,
    height: u32,
) -> Result<web_sys::ImageData, JsValue> {
    render_page(pdf_bytes, page_index, width, height)
}

#[wasm_bindgen(start)]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}
