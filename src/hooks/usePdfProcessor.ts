import { useState, useCallback, useRef } from 'react';
import type { PdfInfo } from '../types/pdf';
import { createPdfProcessor, PdfProcessor } from '../lib/pdfProcessor';

const MAX_FILE_SIZE_MB = 25;

export const usePdfProcessor = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfProcessor, setPdfProcessor] = useState<PdfProcessor | null>(null);
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null);
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const revokePreviewUrl = useCallback(() => {
    if (previewUrlRef.current?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }, []);

  const processPdf = useCallback(async (file: File) => {
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('PDFファイルを選択してください。');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`ファイルサイズは ${MAX_FILE_SIZE_MB}MB 以下にしてください。`);
      return;
    }

    setLoading(true);
    setError(null);
    setPdfFile(file);
    revokePreviewUrl();

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const processor = await createPdfProcessor(uint8Array);

      if (!processor.is_valid_pdf()) {
        throw new Error('有効なPDFファイルではありません。');
      }

      const info = processor.get_info();
      const dataUrl = await processor.get_preview_data_url();
      previewUrlRef.current = dataUrl;

      setPdfProcessor(processor);
      setPdfInfo(info);
      setPdfDataUrl(dataUrl);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err instanceof Error ? err.message : 'PDFの処理中にエラーが発生しました。');
      setPdfFile(null);
      setPdfProcessor(null);
      setPdfInfo(null);
      setPdfDataUrl(null);
    } finally {
      setLoading(false);
    }
  }, [revokePreviewUrl]);

  const resetPdf = useCallback(() => {
    pdfProcessor?.revokeUrls();
    revokePreviewUrl();
    setPdfFile(null);
    setPdfProcessor(null);
    setPdfInfo(null);
    setPdfDataUrl(null);
    setError(null);
  }, [pdfProcessor, revokePreviewUrl]);

  const updatePdfPreview = useCallback(async () => {
    if (!pdfProcessor) return;

    try {
      revokePreviewUrl();
      const updatedDataUrl = await pdfProcessor.get_preview_data_url();
      previewUrlRef.current = updatedDataUrl;
      setPdfDataUrl(updatedDataUrl);
    } catch (previewError) {
      console.error('Failed to update PDF preview:', previewError);
    }
  }, [pdfProcessor, revokePreviewUrl]);

  const generateEditedPdf = useCallback(async () => {
    if (!pdfProcessor || !pdfFile) return null;

    try {
      const editedPdfUrl = await pdfProcessor.generate_edited_pdf_async();
      revokePreviewUrl();
      previewUrlRef.current = editedPdfUrl;
      setPdfDataUrl(editedPdfUrl);

      const link = document.createElement('a');
      link.href = editedPdfUrl;
      link.download = `edited_${pdfFile.name}`;
      document.body.appendChild(link);
      try {
        link.click();
      } catch (clickError) {
        console.warn('Download trigger failed:', clickError);
      }
      document.body.removeChild(link);

      return editedPdfUrl;
    } catch (downloadError) {
      console.error('Failed to generate edited PDF:', downloadError);
      throw downloadError instanceof Error ? downloadError : new Error('PDF生成に失敗しました');
    }
  }, [pdfProcessor, pdfFile, revokePreviewUrl]);

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
