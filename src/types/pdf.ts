// PDF関連の型定義
export interface PdfInfo {
  page_count: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creation_date?: string;
  modification_date?: string;
}

export interface TextAnnotation {
  page: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
}

export interface TextInsertion {
  page: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
  font_family: string;
}

export interface WasmModule {
  PdfProcessor: new (data: Uint8Array) => {
    get_info(): PdfInfo;
    get_size(): number;
    is_valid_pdf(): boolean;
    get_data_url(): string;
    add_text_annotation(annotation: any): Promise<void>;
    add_text_insertion(insertion: any): Promise<void>;
    get_annotations(): any[];
    get_text_insertions(): any[];
    remove_annotation(index: number): boolean;
    remove_text_insertion(index: number): boolean;
    clear_annotations(): void;
    clear_text_insertions(): void;
    clear_all_edits(): void;
    is_modified(): boolean;
    generate_edited_pdf(): string;
    get_page_dimensions(page: number): any;
  };
  process_pdf_buffer(data: Uint8Array): PdfInfo | null;
  log(message: string): void;
}

export type ViewMode = 'view' | 'edit';
export type EditTool = 'select' | 'annotation' | 'text';

export interface PendingEdit {
  x: number;
  y: number;
  page: number;
} 