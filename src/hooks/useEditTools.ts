import { useState, useCallback, useEffect } from 'react';
import type { TextAnnotation, TextInsertion, EditTool, ViewMode, PendingEdit } from '../types/pdf';

export const useEditTools = (pdfProcessor: any, updatePdfPreview?: () => void) => {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [textInsertions, setTextInsertions] = useState<TextInsertion[]>([]);
  const [selectedTool, setSelectedTool] = useState<EditTool>('select');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingText, setIsAddingText] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  // 既存の編集内容を読み込み
  useEffect(() => {
    if (pdfProcessor) {
      try {
        const existingAnnotations = pdfProcessor.get_annotations();
        const existingInsertions = pdfProcessor.get_text_insertions();
        setAnnotations(existingAnnotations);
        setTextInsertions(existingInsertions);
      } catch (error) {
        console.error('Failed to load existing edits:', error);
      }
    }
  }, [pdfProcessor]);

  const toggleEditMode = useCallback(() => {
    setViewMode(viewMode === 'view' ? 'edit' : 'view');
    if (viewMode === 'edit') {
      setSelectedTool('select');
      setIsAddingText(false);
      setPendingEdit(null);
    }
  }, [viewMode]);

  const resetEditState = useCallback(() => {
    setViewMode('view');
    setAnnotations([]);
    setTextInsertions([]);
    setSelectedTool('select');
    setIsAddingText(false);
    setPendingEdit(null);
    setTextInput('');
  }, []);

  // 注釈を追加
  const addTextAnnotation = useCallback(async (x: number, y: number) => {
    if (!textInput.trim()) {
      alert('テキストを入力してください');
      return;
    }

    const annotation: TextAnnotation = {
      page: currentPage,
      x,
      y,
      text: textInput,
      font_size: fontSize,
      color: textColor,
    };

    try {
      await pdfProcessor.add_text_annotation(annotation);
      const updatedAnnotations = pdfProcessor.get_annotations();
      setAnnotations(updatedAnnotations);
      setTextInput('');
      setIsAddingText(false);
      setPendingEdit(null);
      
      // PDFプレビューを更新
      if (updatePdfPreview) {
        updatePdfPreview();
      }
    } catch (error) {
      console.error('Failed to add annotation:', error);
      alert('注釈の追加に失敗しました');
    }
  }, [pdfProcessor, textInput, fontSize, textColor, currentPage]);

  // テキスト挿入を追加
  const addTextInsertion = useCallback(async (x: number, y: number) => {
    if (!textInput.trim()) {
      alert('テキストを入力してください');
      return;
    }

    const insertion: TextInsertion = {
      page: currentPage,
      x,
      y,
      text: textInput,
      font_size: fontSize,
      color: textColor,
      font_family: fontFamily,
    };

    try {
      await pdfProcessor.add_text_insertion(insertion);
      const updatedInsertions = pdfProcessor.get_text_insertions();
      setTextInsertions(updatedInsertions);
      setTextInput('');
      setIsAddingText(false);
      setPendingEdit(null);
      
      // PDFプレビューを更新
      if (updatePdfPreview) {
        updatePdfPreview();
      }
    } catch (error) {
      console.error('Failed to add text insertion:', error);
      alert('テキスト挿入に失敗しました');
    }
  }, [pdfProcessor, textInput, fontSize, textColor, fontFamily, currentPage]);

  // 注釈を削除
  const removeAnnotation = useCallback(async (index: number) => {
    try {
      const success = pdfProcessor.remove_annotation(index);
      if (success) {
        const updatedAnnotations = pdfProcessor.get_annotations();
        setAnnotations(updatedAnnotations);
      }
    } catch (error) {
      console.error('Failed to remove annotation:', error);
    }
  }, [pdfProcessor]);

  // テキスト挿入を削除
  const removeTextInsertion = useCallback(async (index: number) => {
    try {
      const success = pdfProcessor.remove_text_insertion(index);
      if (success) {
        const updatedInsertions = pdfProcessor.get_text_insertions();
        setTextInsertions(updatedInsertions);
      }
    } catch (error) {
      console.error('Failed to remove text insertion:', error);
    }
  }, [pdfProcessor]);

  // 全ての編集をクリア
  const clearAllEdits = useCallback(() => {
    pdfProcessor.clear_all_edits();
    setAnnotations([]);
    setTextInsertions([]);
  }, [pdfProcessor]);

  // テキスト入力をキャンセル
  const cancelTextInput = useCallback(() => {
    setIsAddingText(false);
    setPendingEdit(null);
    setTextInput('');
  }, []);

  // PDF上でのクリックハンドラ
  const handleOverlayClick = useCallback((x: number, y: number) => {
    if (viewMode !== 'edit' || selectedTool === 'select') return;

    if (isAddingText) {
      if (selectedTool === 'annotation') {
        addTextAnnotation(x, y);
      } else if (selectedTool === 'text') {
        addTextInsertion(x, y);
      }
    } else {
      setPendingEdit({ x, y, page: currentPage });
      setIsAddingText(true);
    }
  }, [viewMode, selectedTool, isAddingText, addTextAnnotation, addTextInsertion, currentPage]);

  return {
    // State
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
    
    // Setters
    setSelectedTool,
    setTextInput,
    setFontSize,
    setTextColor,
    setFontFamily,
    setCurrentPage,
    
    // Actions
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