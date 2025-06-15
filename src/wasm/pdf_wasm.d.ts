/* tslint:disable */
/* eslint-disable */
export function greet(): void;
export function process_pdf_buffer(data: Uint8Array): any;
export function log(s: string): void;
export class PdfProcessor {
  free(): void;
  constructor(data: Uint8Array);
  get_info(): any;
  get_size(): number;
  is_valid_pdf(): boolean;
  get_data_url(): string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly greet: () => void;
  readonly __wbg_pdfprocessor_free: (a: number, b: number) => void;
  readonly pdfprocessor_new: (a: any) => number;
  readonly pdfprocessor_get_info: (a: number) => any;
  readonly pdfprocessor_get_size: (a: number) => number;
  readonly pdfprocessor_is_valid_pdf: (a: number) => number;
  readonly pdfprocessor_get_data_url: (a: number) => [number, number];
  readonly process_pdf_buffer: (a: any) => any;
  readonly log: (a: number, b: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
