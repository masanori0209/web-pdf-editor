mod utils;
use wasm_bindgen::prelude::*;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, web-pdf-editor!");
}

#[wasm_bindgen]
pub fn file_upload_view(a: JsValue) {
    console_log!("parameter is {}", &parameter)
}

#[wasm_bindgen]
pub struct FilePDF {
    beforePdf: Vec<u8>,
    afterPdf: Vec<u8>,
}

#[wasm_bindgen]
impl FilePDF {
    pub fn new(beforePdf: Vec<u8>, afterPdf: Vec<u8>) -> FilePDF {
        FilePDF { beforePdf, afterPdf }
    }
}