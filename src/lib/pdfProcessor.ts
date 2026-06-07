import { PDFDocument, rgb, type RGB } from 'pdf-lib';
import type { PdfInfo, TextAnnotation, TextInsertion } from '../types/pdf';
import { embedFontForPdf, estimateTextWidth } from './fonts';

function parseHexColor(hex: string): RGB {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const r = parseInt(value.slice(0, 2), 16) / 255;
  const g = parseInt(value.slice(2, 4), 16) / 255;
  const b = parseInt(value.slice(4, 6), 16) / 255;
  return rgb(r, g, b);
}

function formatPdfDate(date: Date | undefined): string | undefined {
  if (!date) return undefined;
  return date.toLocaleString('ja-JP');
}

export class PdfProcessor {
  private pdfDoc: PDFDocument;
  private originalBytes: Uint8Array;
  private annotations: TextAnnotation[] = [];
  private textInsertions: TextInsertion[] = [];
  private modified = false;
  private cachedDataUrl: string | null = null;

  constructor(data: Uint8Array) {
    this.originalBytes = data;
    this.pdfDoc = null as unknown as PDFDocument;
    this.initPromise = this.initialize(data);
  }

  private initPromise: Promise<void>;
  private initialized = false;

  private async initialize(data: Uint8Array): Promise<void> {
    this.pdfDoc = await PDFDocument.load(data, { ignoreEncryption: true });
    this.initialized = true;
  }

  private async ensureReady(): Promise<void> {
    await this.initPromise;
    if (!this.initialized) {
      throw new Error('PDF processor is not initialized');
    }
  }

  async waitUntilReady(): Promise<void> {
    await this.ensureReady();
  }

  is_valid_pdf(): boolean {
    return this.originalBytes.length > 4
      && String.fromCharCode(...this.originalBytes.slice(0, 4)) === '%PDF';
  }

  get_size(): number {
    return this.originalBytes.length;
  }

  get_info(): PdfInfo {
    if (!this.pdfDoc) {
      return { page_count: 0 };
    }

    return {
      page_count: this.pdfDoc.getPageCount(),
      title: this.pdfDoc.getTitle() || undefined,
      author: this.pdfDoc.getAuthor() || undefined,
      subject: this.pdfDoc.getSubject() || undefined,
      creator: this.pdfDoc.getCreator() || undefined,
      producer: this.pdfDoc.getProducer() || undefined,
      creation_date: formatPdfDate(this.pdfDoc.getCreationDate()),
      modification_date: formatPdfDate(this.pdfDoc.getModificationDate()),
    };
  }

  get_page_dimensions(page: number): { width: number; height: number } {
    const pdfPage = this.pdfDoc.getPage(page - 1);
    const { width, height } = pdfPage.getSize();
    return { width, height };
  }

  get_annotations(): TextAnnotation[] {
    return [...this.annotations];
  }

  get_text_insertions(): TextInsertion[] {
    return [...this.textInsertions];
  }

  is_modified(): boolean {
    return this.modified;
  }

  async add_text_annotation(annotation: TextAnnotation): Promise<void> {
    await this.ensureReady();
    this.annotations.push({ ...annotation });
    this.modified = true;
    this.cachedDataUrl = null;
  }

  async add_text_insertion(insertion: TextInsertion): Promise<void> {
    await this.ensureReady();
    this.textInsertions.push({ ...insertion });
    this.modified = true;
    this.cachedDataUrl = null;
  }

  remove_annotation(index: number): boolean {
    if (index < 0 || index >= this.annotations.length) return false;
    this.annotations.splice(index, 1);
    this.modified = this.annotations.length > 0 || this.textInsertions.length > 0;
    this.cachedDataUrl = null;
    return true;
  }

  remove_text_insertion(index: number): boolean {
    if (index < 0 || index >= this.textInsertions.length) return false;
    this.textInsertions.splice(index, 1);
    this.modified = this.annotations.length > 0 || this.textInsertions.length > 0;
    this.cachedDataUrl = null;
    return true;
  }

  clear_all_edits(): void {
    this.annotations = [];
    this.textInsertions = [];
    this.modified = false;
    this.cachedDataUrl = null;
  }

  clear_annotations(): void {
    this.annotations = [];
    this.modified = true;
    this.cachedDataUrl = null;
  }

  clear_text_insertions(): void {
    this.textInsertions = [];
    this.modified = true;
    this.cachedDataUrl = null;
  }

  get_data_url(): string {
    if (this.cachedDataUrl) {
      return this.cachedDataUrl;
    }

    const blob = new Blob([this.originalBytes.slice()], { type: 'application/pdf' });
    this.cachedDataUrl = URL.createObjectURL(blob);
    return this.cachedDataUrl;
  }

  async get_preview_data_url(): Promise<string> {
    await this.ensureReady();

    if (!this.modified && this.annotations.length === 0 && this.textInsertions.length === 0) {
      return this.get_data_url();
    }

    const bytes = await this.buildEditedPdfBytes();
    return URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
  }

  generate_edited_pdf(): string {
    void this.buildEditedPdfBytes().then((bytes) => {
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      this.cachedDataUrl = url;
    });
    return this.cachedDataUrl ?? this.get_data_url();
  }

  async generate_edited_pdf_async(): Promise<string> {
    const bytes = await this.buildEditedPdfBytes();
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    this.cachedDataUrl = url;
    return url;
  }

  private screenToPdfY(pageHeight: number, screenY: number, fontSize: number): number {
    return pageHeight - screenY - fontSize;
  }

  private async buildEditedPdfBytes(): Promise<Uint8Array> {
    await this.ensureReady();
    const pdfDoc = await PDFDocument.load(this.originalBytes, { ignoreEncryption: true });

    for (const annotation of this.annotations) {
      const page = pdfDoc.getPage(annotation.page - 1);
      const { height } = page.getSize();
      const fontFamily = annotation.font_family;
      const font = await embedFontForPdf(pdfDoc, fontFamily, annotation.text);
      const fontSize = annotation.font_size;
      const color = parseHexColor(annotation.color);
      const pdfY = this.screenToPdfY(height, annotation.y, fontSize);
      const textWidth = font.widthOfTextAtSize(annotation.text, fontSize);

      page.drawRectangle({
        x: annotation.x - 4,
        y: pdfY - 4,
        width: Math.max(textWidth, estimateTextWidth(annotation.text, fontSize, fontFamily)) + 8,
        height: fontSize + 8,
        color: rgb(1, 0.95, 0.6),
        opacity: 0.85,
      });

      page.drawText(annotation.text, {
        x: annotation.x,
        y: pdfY,
        size: fontSize,
        font,
        color,
      });
    }

    for (const insertion of this.textInsertions) {
      const page = pdfDoc.getPage(insertion.page - 1);
      const { height } = page.getSize();
      const font = await embedFontForPdf(pdfDoc, insertion.font_family, insertion.text);
      const pdfY = this.screenToPdfY(height, insertion.y, insertion.font_size);

      page.drawText(insertion.text, {
        x: insertion.x,
        y: pdfY,
        size: insertion.font_size,
        font,
        color: parseHexColor(insertion.color),
      });
    }

    return pdfDoc.save();
  }

  revokeUrls(): void {
    if (this.cachedDataUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(this.cachedDataUrl);
      this.cachedDataUrl = null;
    }
  }
}

export async function createPdfProcessor(data: Uint8Array): Promise<PdfProcessor> {
  const processor = new PdfProcessor(data);
  await processor.waitUntilReady();
  return processor;
}
