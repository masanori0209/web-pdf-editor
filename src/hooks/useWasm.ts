import { useState, useEffect } from 'react';
import type { WasmModule } from '../types/pdf';

export const useWasm = () => {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initWasm = async () => {
      try {
        // 直接fetchでモジュールを読み込み
        const response = await fetch('/wasm/pdf_wasm.js');
        const moduleText = await response.text();
        
        // モジュールを動的に実行
        const moduleBlob = new Blob([moduleText], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(moduleBlob);
        
        const wasmModule = await import(moduleUrl);
        await wasmModule.default('/wasm/pdf_wasm_bg.wasm');
        
        setWasmModule({
          PdfProcessor: wasmModule.PdfProcessor,
          process_pdf_buffer: wasmModule.process_pdf_buffer,
          log: wasmModule.log,
        });
        
        console.log('WASM module loaded successfully');
        URL.revokeObjectURL(moduleUrl);
      } catch (err) {
        console.error('Failed to load WASM module:', err);
        setError('WebAssemblyモジュールの読み込みに失敗しました。ブラウザがWebAssemblyをサポートしているか確認してください。');
      }
    };

    initWasm();
  }, []);

  return { wasmModule, error };
};