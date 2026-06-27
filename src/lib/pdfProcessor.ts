import init, {
  initialize_pdfium_render,
  WasmPdfProcessor,
  set_japanese_font_bytes,
  wasm_render_page,
  wasm_get_page_dimensions,
} from '../wasm/pkg/pdf_wasm.js';
import wasmUrl from '../wasm/pkg/pdf_wasm_bg.wasm?url';
import type { EditObject, PdfInfo, TextAnnotation, TextInsertion } from '../types/pdf';
import { loadJapaneseFontBytes } from './fonts';

declare global {
  interface Window {
    PDFiumModule?: () => Promise<Record<string, unknown>>;
  }
}

let initPromise: Promise<void> | null = null;

async function loadPdfiumScript(): Promise<void> {
  if (window.PDFiumModule) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${import.meta.env.BASE_URL}pdfium/pdfium.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PDFium WASM の読み込みに失敗しました。npm run setup:pdfium を実行してください。'));
    document.head.appendChild(script);
  });
}

export async function initPdfEngine(): Promise<void> {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    await loadPdfiumScript();
    const pdfiumModule = await window.PDFiumModule!();
    const rustModule = await init(wasmUrl);
    const initialized = initialize_pdfium_render(pdfiumModule, rustModule, false);
    if (!initialized) {
      throw new Error('PDFium エンジンの初期化に失敗しました');
    }

    try {
      const fontBytes = await loadJapaneseFontBytes();
      set_japanese_font_bytes(fontBytes);
    } catch (error) {
      console.warn('Japanese font not loaded for WASM engine:', error);
    }
  })();

  return initPromise;
}

export async function fetchPdfBytes(dataUrl: string): Promise<Uint8Array> {
  const response = await fetch(dataUrl);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export { wasm_render_page, wasm_get_page_dimensions };

export class PdfProcessor {
  private inner: WasmPdfProcessor;
  private cachedDataUrl: string | null = null;

  constructor(inner: WasmPdfProcessor) {
    this.inner = inner;
  }

  async waitUntilReady(): Promise<void> {
    await initPdfEngine();
  }

  is_valid_pdf(): boolean {
    return this.inner.is_valid_pdf();
  }

  get_size(): number {
    return this.inner.get_size();
  }

  get_info(): PdfInfo {
    return this.inner.get_info() as PdfInfo;
  }

  get_annotations(): TextAnnotation[] {
    return this.inner.get_annotations() as TextAnnotation[];
  }

  get_text_insertions(): TextInsertion[] {
    return this.inner.get_text_insertions() as TextInsertion[];
  }

  get_edit_objects(): EditObject[] {
    return this.inner.get_edit_objects() as EditObject[];
  }

  is_modified(): boolean {
    return this.inner.is_modified();
  }

  async add_text_annotation(annotation: TextAnnotation): Promise<void> {
    this.inner.add_text_annotation(
      annotation.page,
      annotation.x,
      annotation.y,
      annotation.text,
      annotation.font_size,
      annotation.color,
      annotation.font_family,
    );
    this.cachedDataUrl = null;
  }

  async add_text_insertion(insertion: TextInsertion): Promise<void> {
    this.inner.add_text_insertion(
      insertion.page,
      insertion.x,
      insertion.y,
      insertion.text,
      insertion.font_size,
      insertion.color,
      insertion.font_family,
    );
    this.cachedDataUrl = null;
  }

  async add_edit_object(editObject: EditObject): Promise<void> {
    this.inner.add_edit_object(editObject);
    this.cachedDataUrl = null;
  }

  async update_edit_object(editObject: EditObject): Promise<boolean> {
    const updated = this.inner.update_edit_object(editObject.id, editObject);
    if (updated) {
      this.cachedDataUrl = null;
    }
    return updated;
  }

  remove_edit_object(id: string): boolean {
    const removed = this.inner.remove_edit_object(id);
    if (removed) {
      this.cachedDataUrl = null;
    }
    return removed;
  }

  remove_annotation(index: number): boolean {
    const removed = this.inner.remove_annotation(index);
    if (removed) {
      this.cachedDataUrl = null;
    }
    return removed;
  }

  remove_text_insertion(index: number): boolean {
    const removed = this.inner.remove_text_insertion(index);
    if (removed) {
      this.cachedDataUrl = null;
    }
    return removed;
  }

  clear_all_edits(): void {
    this.inner.clear_all_edits();
    this.cachedDataUrl = null;
  }

  clear_annotations(): void {
    const annotations = this.get_annotations();
    for (let index = annotations.length - 1; index >= 0; index -= 1) {
      this.inner.remove_annotation(index);
    }
    this.cachedDataUrl = null;
  }

  clear_text_insertions(): void {
    const insertions = this.get_text_insertions();
    for (let index = insertions.length - 1; index >= 0; index -= 1) {
      this.inner.remove_text_insertion(index);
    }
    this.cachedDataUrl = null;
  }

  get_data_url(): string {
    if (this.cachedDataUrl) {
      return this.cachedDataUrl;
    }

    const blob = new Blob([this.inner.get_original_bytes()], { type: 'application/pdf' });
    this.cachedDataUrl = URL.createObjectURL(blob);
    return this.cachedDataUrl;
  }

  async get_preview_data_url(): Promise<string> {
    // 編集プレビューは React オーバーレイで表示。WASM 再生成は保存時のみ。
    return this.get_data_url();
  }

  generate_edited_pdf(): string {
    void this.generate_edited_pdf_async();
    return this.cachedDataUrl ?? this.get_data_url();
  }

  async generate_edited_pdf_async(): Promise<string> {
    const bytes = this.inner.generate_pdf_bytes();

    if (this.cachedDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedDataUrl);
    }
    this.cachedDataUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    return this.cachedDataUrl;
  }

  revokeUrls(): void {
    if (this.cachedDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedDataUrl);
      this.cachedDataUrl = null;
    }
  }

  free(): void {
    this.revokeUrls();
    this.inner.free();
  }
}

export async function createPdfProcessor(data: Uint8Array): Promise<PdfProcessor> {
  await initPdfEngine();
  const inner = new WasmPdfProcessor(data);
  return new PdfProcessor(inner);
}
