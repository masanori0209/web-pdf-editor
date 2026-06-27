import { useState, useCallback, useEffect } from 'react';
import type {
  EditObject,
  EditObjectKind,
  TextAnnotation,
  TextInsertion,
  EditTool,
  ViewMode,
  PendingEdit,
} from '../types/pdf';
import type { PdfProcessor } from '../lib/pdfProcessor';

const TEXT_DEFAULT_WIDTH = 160;
const TEXT_DEFAULT_HEIGHT = 32;
const SHAPE_DEFAULT_SIZE = 96;

const createEditObjectId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `edit-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const shapeToolToKind = (tool: EditTool): EditObjectKind | null => {
  if (
    tool === 'rectangle'
    || tool === 'ellipse'
    || tool === 'line'
    || tool === 'arrow'
    || tool === 'callout'
    || tool === 'slash'
  ) {
    return tool;
  }
  if (tool === 'text') return 'text';
  return null;
};

export const useEditTools = (
  pdfProcessor: PdfProcessor | null,
  updatePdfPreview?: () => void | Promise<void>,
  showToast?: (message: string, type?: 'info' | 'success' | 'error') => void,
) => {
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);
  const [textInsertions, setTextInsertions] = useState<TextInsertion[]>([]);
  const [editObjects, setEditObjects] = useState<EditObject[]>([]);
  const [selectedEditObjectId, setSelectedEditObjectId] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<EditTool>('select');
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [textColor, setTextColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Noto Sans JP');
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [strikeThrough, setStrikeThrough] = useState(false);
  const [strokeColor, setStrokeColor] = useState('#2563eb');
  const [fillColor, setFillColor] = useState('#eff6ff');
  const [fillEnabled, setFillEnabled] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [opacity, setOpacity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddingText, setIsAddingText] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null);

  useEffect(() => {
    if (pdfProcessor) {
      setAnnotations(pdfProcessor.get_annotations());
      setTextInsertions(pdfProcessor.get_text_insertions());
      setEditObjects(pdfProcessor.get_edit_objects());
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

  const enterEditMode = useCallback(() => {
    setViewMode('edit');
  }, []);

  const resetEditState = useCallback(() => {
    setViewMode('view');
    setAnnotations([]);
    setTextInsertions([]);
    setEditObjects([]);
    setSelectedEditObjectId(null);
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
      const editObject: EditObject = {
        id: createEditObjectId(),
        page: insertion.page,
        kind: 'text',
        x,
        y,
        width: TEXT_DEFAULT_WIDTH,
        height: TEXT_DEFAULT_HEIGHT,
        text: insertion.text,
        font_size: insertion.font_size,
        color: insertion.color,
        font_family: insertion.font_family,
        bold,
        italic,
        strike_through: strikeThrough,
        stroke_color: strokeColor,
        fill_color: fillColor,
        fill_enabled: false,
        stroke_width: strokeWidth,
        opacity: 1,
      };
      await pdfProcessor.add_edit_object(editObject);
      setEditObjects(pdfProcessor.get_edit_objects());
      setSelectedEditObjectId(editObject.id);
      setTextInput('');
      setIsAddingText(false);
      setPendingEdit(null);
      await refreshPreview();
      showToast?.('テキストを挿入しました', 'success');
    } catch (insertionError) {
      console.error('Failed to add text insertion:', insertionError);
      showToast?.('テキスト挿入に失敗しました', 'error');
    }
  }, [
    pdfProcessor,
    textInput,
    fontSize,
    textColor,
    fontFamily,
    bold,
    italic,
    strikeThrough,
    strokeColor,
    fillColor,
    strokeWidth,
    currentPage,
    refreshPreview,
    showToast,
  ]);

  const addEditObject = useCallback(async (
    kind: EditObjectKind,
    x: number,
    y: number,
    width = SHAPE_DEFAULT_SIZE,
    height = SHAPE_DEFAULT_SIZE,
  ) => {
    if (!pdfProcessor) {
      showToast?.('PDFが読み込まれていません', 'error');
      return;
    }

    const normalizedWidth = Math.abs(width) < 8 ? (width < 0 ? -SHAPE_DEFAULT_SIZE : SHAPE_DEFAULT_SIZE) : width;
    const normalizedHeight = Math.abs(height) < 8 ? (height < 0 ? -SHAPE_DEFAULT_SIZE : SHAPE_DEFAULT_SIZE) : height;
    const editObject: EditObject = {
      id: createEditObjectId(),
      page: currentPage,
      kind,
      x,
      y,
      width: kind === 'text' ? TEXT_DEFAULT_WIDTH : normalizedWidth,
      height: kind === 'text' ? TEXT_DEFAULT_HEIGHT : normalizedHeight,
      text: kind === 'callout' ? (textInput.trim() || 'コメント') : '',
      font_size: fontSize,
      color: textColor,
      font_family: fontFamily,
      bold,
      italic,
      strike_through: strikeThrough,
      stroke_color: strokeColor,
      fill_color: fillColor,
      fill_enabled: kind === 'callout' ? true : fillEnabled,
      stroke_width: strokeWidth,
      opacity,
    };

    try {
      await pdfProcessor.add_edit_object(editObject);
      setEditObjects(pdfProcessor.get_edit_objects());
      setSelectedEditObjectId(editObject.id);
      setSelectedTool('select');
      setTextInput('');
      await refreshPreview();
      showToast?.('編集オブジェクトを追加しました', 'success');
    } catch (addError) {
      console.error('Failed to add edit object:', addError);
      showToast?.('編集オブジェクトの追加に失敗しました', 'error');
    }
  }, [
    pdfProcessor,
    currentPage,
    textInput,
    fontSize,
    textColor,
    fontFamily,
    bold,
    italic,
    strikeThrough,
    strokeColor,
    fillColor,
    fillEnabled,
    strokeWidth,
    opacity,
    refreshPreview,
    showToast,
  ]);

  const updateEditObject = useCallback(async (editObject: EditObject) => {
    if (!pdfProcessor) return;

    try {
      const updated = await pdfProcessor.update_edit_object(editObject);
      if (updated) {
        setEditObjects(pdfProcessor.get_edit_objects());
      }
    } catch (updateError) {
      console.error('Failed to update edit object:', updateError);
      showToast?.('編集オブジェクトの更新に失敗しました', 'error');
    }
  }, [pdfProcessor, showToast]);

  const updateSelectedEditObject = useCallback(async (patch: Partial<EditObject>) => {
    const current = editObjects.find((item) => item.id === selectedEditObjectId);
    if (!current) return;
    await updateEditObject({ ...current, ...patch });
  }, [editObjects, selectedEditObjectId, updateEditObject]);

  const removeEditObject = useCallback(async (id: string) => {
    if (!pdfProcessor) return;

    try {
      const removed = pdfProcessor.remove_edit_object(id);
      if (removed) {
        setEditObjects(pdfProcessor.get_edit_objects());
        if (selectedEditObjectId === id) {
          setSelectedEditObjectId(null);
        }
        await refreshPreview();
        showToast?.('編集オブジェクトを削除しました', 'info');
      }
    } catch (removeError) {
      console.error('Failed to remove edit object:', removeError);
      showToast?.('編集オブジェクトの削除に失敗しました', 'error');
    }
  }, [pdfProcessor, selectedEditObjectId, refreshPreview, showToast]);

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
    setEditObjects([]);
    setSelectedEditObjectId(null);
    await refreshPreview();
    showToast?.('編集内容をすべて削除しました', 'info');
  }, [pdfProcessor, refreshPreview, showToast]);

  const cancelTextInput = useCallback(() => {
    setIsAddingText(false);
    setPendingEdit(null);
  }, []);

  const handleOverlayClick = useCallback((x: number, y: number) => {
    if (viewMode !== 'edit' || selectedTool === 'select') return;

    const kind = shapeToolToKind(selectedTool);
    if (kind && kind !== 'text') {
      void addEditObject(kind, x, y);
      return;
    }

    setPendingEdit({ x, y, page: currentPage });
    setIsAddingText(true);
  }, [viewMode, selectedTool, currentPage, addEditObject]);

  return {
    viewMode,
    annotations,
    textInsertions,
    editObjects,
    selectedEditObjectId,
    selectedTool,
    textInput,
    fontSize,
    textColor,
    fontFamily,
    bold,
    italic,
    strikeThrough,
    strokeColor,
    fillColor,
    fillEnabled,
    strokeWidth,
    opacity,
    currentPage,
    isAddingText,
    pendingEdit,
    setSelectedTool,
    setTextInput,
    setFontSize,
    setTextColor,
    setFontFamily,
    setBold,
    setItalic,
    setStrikeThrough,
    setStrokeColor,
    setFillColor,
    setFillEnabled,
    setStrokeWidth,
    setOpacity,
    setSelectedEditObjectId,
    setCurrentPage,
    toggleEditMode,
    enterEditMode,
    resetEditState,
    addTextAnnotation,
    addTextInsertion,
    addEditObject,
    updateEditObject,
    updateSelectedEditObject,
    removeAnnotation,
    removeTextInsertion,
    removeEditObject,
    clearAllEdits,
    cancelTextInput,
    handleOverlayClick,
  };
};
