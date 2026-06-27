import { useEffect } from 'react';
import './App.css';
import { preloadJapaneseFont } from './lib/fonts';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { useEditTools } from './hooks/useEditTools';
import { useToast } from './components/Toast';

import { PdfUploader } from './components/PdfUploader';
import { PdfViewer } from './components/PdfViewer';
import { EditToolbar } from './components/EditToolbar';
import { EditOverlay } from './components/EditOverlay';
import { TextInputPopup } from './components/TextInputPopup';

function App() {
  useEffect(() => {
    void preloadJapaneseFont().catch((error) => {
      console.warn('Japanese font preload failed:', error);
    });
  }, []);

  const { showToast } = useToast();

  const {
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
  } = usePdfProcessor();

  const {
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
  } = useEditTools(pdfProcessor, updatePdfPreview, showToast);

  useEffect(() => {
    if (pdfProcessor) {
      enterEditMode();
    }
  }, [pdfProcessor, enterEditMode]);

  const handleReset = () => {
    resetPdf();
    resetEditState();
  };

  const handleOpenOtherFile = () => {
    if (window.confirm('別のファイルを開きますか？未保存の編集内容は失われます。')) {
      handleReset();
    }
  };

  const handleSave = async () => {
    try {
      await generateEditedPdf();
      showToast('PDFをダウンロードしました', 'success');
    } catch (saveError) {
      console.error('Save failed:', saveError);
      showToast(saveError instanceof Error ? saveError.message : '保存に失敗しました', 'error');
    }
  };

  const handleConfirmTextInput = async () => {
    if (!pendingEdit) return;

    if (selectedTool === 'annotation') {
      await addTextAnnotation(pendingEdit.x, pendingEdit.y);
    } else if (selectedTool === 'text') {
      await addTextInsertion(pendingEdit.x, pendingEdit.y);
    }
  };

  const isModified = pdfProcessor ? pdfProcessor.is_modified() : false;

  return (
    <div className="app-shell">
      <header className="app-bar">
        <div className="app-bar__brand">
          <h1>PDF Editor</h1>
          {pdfFile && pdfInfo && (
            <span className="app-bar__meta">
              {pdfFile.name}
              <span aria-hidden="true"> · </span>
              <span>ページ数: {pdfInfo.page_count}</span>
            </span>
          )}
        </div>

        {pdfFile && pdfInfo && (
          <div className="app-bar__actions">
            <button
              type="button"
              onClick={toggleEditMode}
              className={`btn btn--primary ${viewMode === 'edit' ? 'is-active' : ''}`}
              aria-pressed={viewMode === 'edit'}
            >
              {viewMode === 'view' ? '編集モード' : '表示モード'}
            </button>
            <button type="button" onClick={handleOpenOtherFile} className="btn btn--ghost">
              別のファイル
            </button>
          </div>
        )}
      </header>

      <main className="main-content">
        {!pdfFile ? (
          <PdfUploader
            onFileSelect={processPdf}
            loading={loading}
            error={error}
            onReset={handleReset}
          />
        ) : pdfInfo && pdfDataUrl ? (
          <div className={`editor-layout ${viewMode === 'edit' ? 'edit-mode' : ''}`}>
            <PdfViewer
              pdfInfo={pdfInfo}
              pdfDataUrl={pdfDataUrl}
              currentPage={currentPage}
              viewMode={viewMode}
              selectedTool={selectedTool}
              textInsertions={textInsertions}
              annotations={annotations}
              onPageChange={setCurrentPage}
            >
              <EditOverlay
                viewMode={viewMode}
                selectedTool={selectedTool}
                currentPage={currentPage}
                editObjects={editObjects}
                selectedEditObjectId={selectedEditObjectId}
                onOverlayClick={handleOverlayClick}
                onCreateEditObject={addEditObject}
                onSelectEditObject={setSelectedEditObjectId}
                onUpdateEditObject={updateEditObject}
              />
              <TextInputPopup
                isVisible={isAddingText}
                pendingEdit={pendingEdit}
                selectedTool={selectedTool}
                textInput={textInput}
                onTextInputChange={setTextInput}
                onConfirm={handleConfirmTextInput}
                onCancel={cancelTextInput}
              />
            </PdfViewer>

            {viewMode === 'edit' && pdfProcessor && (
              <EditToolbar
                selectedTool={selectedTool}
                onToolSelect={setSelectedTool}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                textColor={textColor}
                onTextColorChange={setTextColor}
                fontFamily={fontFamily}
                onFontFamilyChange={setFontFamily}
                bold={bold}
                onBoldChange={setBold}
                italic={italic}
                onItalicChange={setItalic}
                strikeThrough={strikeThrough}
                onStrikeThroughChange={setStrikeThrough}
                strokeColor={strokeColor}
                onStrokeColorChange={setStrokeColor}
                fillColor={fillColor}
                onFillColorChange={setFillColor}
                fillEnabled={fillEnabled}
                onFillEnabledChange={setFillEnabled}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
                opacity={opacity}
                onOpacityChange={setOpacity}
                annotations={annotations}
                textInsertions={textInsertions}
                editObjects={editObjects}
                selectedEditObjectId={selectedEditObjectId}
                onSelectEditObject={setSelectedEditObjectId}
                onUpdateSelectedEditObject={updateSelectedEditObject}
                onRemoveAnnotation={removeAnnotation}
                onRemoveTextInsertion={removeTextInsertion}
                onRemoveEditObject={removeEditObject}
                onClearAllEdits={clearAllEdits}
                onSave={handleSave}
                isModified={isModified}
              />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;
