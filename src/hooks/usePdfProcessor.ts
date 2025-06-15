import { useState, useCallback } from 'react';
import type { PdfInfo, WasmModule } from '../types/pdf';

export const usePdfProcessor = (wasmModule: WasmModule | null) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessor, setPdfProcessor] = useState<any>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPdf = useCallback(async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('PDFファイルを選択してください。');
      return;
    }

    if (!wasmModule) {
      setError('WebAssemblyモジュールがまだ読み込まれていません。');
      return;
    }

    setLoading(true);
    setError(null);
    setPdfFile(file);

    try {
      // ファイルをArrayBufferとして読み込み
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Wasmでファイルを処理
      const processor = new wasmModule.PdfProcessor(uint8Array);
      
      if (!processor.is_valid_pdf()) {
        throw new Error('有効なPDFファイルではありません。');
      }

      const info = processor.get_info();
      const dataUrl = processor.get_data_url();

      setPdfProcessor(processor);
      setPdfInfo(info);
      setPdfDataUrl(dataUrl);

      wasmModule.log(`PDF processed: ${file.name}, Size: ${processor.get_size()} bytes`);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'PDFの処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  }, [wasmModule]);

  const resetPdf = useCallback(() => {
    setPdfFile(null);
    setPdfProcessor(null);
    setPdfInfo(null);
    setPdfDataUrl(null);
    setError(null);
  }, []);

  const updatePdfPreview = useCallback(() => {
    if (!pdfProcessor) return;
    
    try {
      const updatedDataUrl = pdfProcessor.get_data_url();
      setPdfDataUrl(updatedDataUrl);
    } catch (error) {
      console.error('Failed to update PDF preview:', error);
    }
  }, [pdfProcessor]);

  const generateEditedPdf = useCallback(async () => {
    if (!pdfProcessor || !pdfFile) return null;

    try {
      const editedPdfUrl = pdfProcessor.generate_edited_pdf();
      setPdfDataUrl(editedPdfUrl);
      
      // 編集されたPDFをダウンロード
      const link = document.createElement('a');
      link.href = editedPdfUrl;
      link.download = `edited_${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      return editedPdfUrl;
    } catch (error) {
      console.error('Failed to generate edited PDF:', error);
      throw new Error('PDF生成に失敗しました');
    }
  }, [pdfProcessor, pdfFile]);

  return {
    pdfFile,
    pdfProcessor,
    pdfInfo,
    pdfDataUrl,
    loading,
    error,
    processPdf,
    resetPdf,
    updatePdfPreview,
    generateEditedPdf,
  };
};