import { useState, useCallback, useEffect } from 'react';
import type { TextAnnotation, TextInsertion, EditTool, ViewMode, PendingEdit } from '../types/pdf';
import type { PdfProcessor } from '../lib/pdfProcessor';

export const useEditTools = (
  pdfProcessor: PdfProcessor | null,
  updatePdfPreview?: () => void | Promise<void>,
  showToast?: (message: string, type?: 'info' | 'success' | 'error') => void,
) => {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [textInsertions, setTextInsertions] = useState<TextInsertion[]>([]);
  const [selectedTool, setSelectedTool] = useState<EditTool>('select');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Noto Sans JP');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingText, setIsAddingText] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  useEffect(() => {
    if (pdfProcessor) {
      setAnnotations(pdfProcessor.get_annotations());
      setTextInsertions(pdfProcessor.get_text_insertions());
    }
  }, [pdfProcessor]);

  const refreshPreview = useCallback(async () => {
    if (updatePdfPreview) {
      await updatePdfPreview();
    }
  }, [updatePdfPreview]);

  const toggleEditMode = useCallback(() => {
    setViewMode((prev) => {
      if (prev === 'edit') {
        setSelectedTool('select');
        setIsAddingText(false);
        setPendingEdit(null);
        return 'view';
      }
      return 'edit';
    });
  }, []);

  const resetEditState = useCallback(() => {
    setViewMode('view');
    setAnnotations([]);
    setTextInsertions([]);
    setSelectedTool('select');
    setIsAddingText(false);
    setPendingEdit(null);
    setTextInput('');
    setCurrentPage(1);
  }, []);

  const addTextAnnotation = useCallback(async (x: number, y: number) => {
    if (!pdfProcessor) {
      showToast?.('PDFが読み込まれていません', 'error');
      return;
    }

    if (!textInput.trim()) {
      showToast?.('テキストを入力してください', 'error');
      return;
    }

    const annotation: TextAnnotation = {
      page: currentPage,
      x,
      y,
      text: textInput.trim(),
      font_size: fontSize,
      color: textColor,
      font_family: fontFamily,
    };

    try {
      await pdfProcessor.add_text_annotation(annotation);
      setAnnotations(pdfProcessor.get_annotations());
      setTextInput('');
      setIsAddingText(false);
      setPendingEdit(null);
      await refreshPreview();
      showToast?.('注釈を追加しました', 'success');
    } catch (annotationError) {
      console.error('Failed to add annotation:', annotationError);
      showToast?.('注釈の追加に失敗しました', 'error');
    }
  }, [pdfProcessor, textInput, fontSize, textColor, fontFamily, currentPage, refreshPreview, showToast]);

  const addTextInsertion = useCallback(async (x: number, y: number) => {
    if (!pdfProcessor) {
      showToast?.('PDFが読み込まれていません', 'error');
      return;
    }

    if (!textInput.trim()) {
      showToast?.('テキストを入力してください', 'error');
      return;
    }

    const insertion: TextInsertion = {
      page: currentPage,
      x,
      y,
      text: textInput.trim(),
      font_size: fontSize,
      color: textColor,
      font_family: fontFamily,
    };

    try {
      await pdfProcessor.add_text_insertion(insertion);
      setTextInsertions(pdfProcessor.get_text_insertions());
      setTextInput('');
      setIsAddingText(false);
      setPendingEdit(null);
      await refreshPreview();
      showToast?.('テキストを挿入しました', 'success');
    } catch (insertionError) {
      console.error('Failed to add text insertion:', insertionError);
      showToast?.('テキスト挿入に失敗しました', 'error');
    }
  }, [pdfProcessor, textInput, fontSize, textColor, fontFamily, currentPage, refreshPreview, showToast]);

  const removeAnnotation = useCallback(async (index: number) => {
    if (!pdfProcessor) return;

    try {
      const success = pdfProcessor.remove_annotation(index);
      if (success) {
        setAnnotations(pdfProcessor.get_annotations());
        await refreshPreview();
        showToast?.('注釈を削除しました', 'info');
      }
    } catch (removeError) {
      console.error('Failed to remove annotation:', removeError);
      showToast?.('注釈の削除に失敗しました', 'error');
    }
  }, [pdfProcessor, refreshPreview, showToast]);

  const removeTextInsertion = useCallback(async (index: number) => {
    if (!pdfProcessor) return;

    try {
      const success = pdfProcessor.remove_text_insertion(index);
      if (success) {
        setTextInsertions(pdfProcessor.get_text_insertions());
        await refreshPreview();
        showToast?.('テキスト挿入を削除しました', 'info');
      }
    } catch (removeError) {
      console.error('Failed to remove text insertion:', removeError);
      showToast?.('テキスト挿入の削除に失敗しました', 'error');
    }
  }, [pdfProcessor, refreshPreview, showToast]);

  const clearAllEdits = useCallback(async () => {
    if (!pdfProcessor) return;
    if (!window.confirm('すべての編集内容を削除しますか？')) return;

    pdfProcessor.clear_all_edits();
    setAnnotations([]);
    setTextInsertions([]);
    await refreshPreview();
    showToast?.('編集内容をすべて削除しました', 'info');
  }, [pdfProcessor, refreshPreview, showToast]);

  const cancelTextInput = useCallback(() => {
    setIsAddingText(false);
    setPendingEdit(null);
  }, []);

  const handleOverlayClick = useCallback((x: number, y: number) => {
    if (viewMode !== 'edit' || selectedTool === 'select') return;

    setPendingEdit({ x, y, page: currentPage });
    setIsAddingText(true);
  }, [viewMode, selectedTool, currentPage]);

  return {
    viewMode,
    annotations,
    textInsertions,
    selectedTool,
    textInput,
    fontSize,
    textColor,
    fontFamily,
    currentPage,
    isAddingText,
    pendingEdit,
    setSelectedTool,
    setTextInput,
    setFontSize,
    setTextColor,
    setFontFamily,
    setCurrentPage,
    toggleEditMode,
    resetEditState,
    addTextAnnotation,
    addTextInsertion,
    removeAnnotation,
    removeTextInsertion,
    clearAllEdits,
    cancelTextInput,
    handleOverlayClick,
  };
};
