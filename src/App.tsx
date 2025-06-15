import React from 'react';
import './App.css';

// Hooks
import { useWasm } from './hooks/useWasm';
import { usePdfProcessor } from './hooks/usePdfProcessor';
import { useEditTools } from './hooks/useEditTools';

// Components
import { PdfUploader } from './components/PdfUploader';
import { PdfViewer } from './components/PdfViewer';
import { EditToolbar } from './components/EditToolbar';
import { EditOverlay } from './components/EditOverlay';
import { TextInputPopup } from './components/TextInputPopup';

function App() {
  // WebAssembly
  const { wasmModule, error: wasmError } = useWasm();

  // PDF処理
  const {
    pdfFile,
    pdfProcessor,
    pdfInfo,
    pdfDataUrl,
    loading,
    error: pdfError,
    processPdf,
    resetPdf,
    updatePdfPreview,
    generateEditedPdf,
  } = usePdfProcessor(wasmModule);

  // 編集ツール
  const {
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
  } = useEditTools(pdfProcessor, updatePdfPreview);

  // エラーハンドリング
  const error = wasmError || pdfError;

  // リセット処理
  const handleReset = () => {
    resetPdf();
    resetEditState();
  };

  // 保存処理
  const handleSave = async () => {
    try {
      await generateEditedPdf();
    } catch (error) {
      console.error('Save failed:', error);
      alert('保存に失敗しました');
    }
  };

  // テキスト入力確定
  const handleConfirmTextInput = async () => {
    if (!pendingEdit) return;

    try {
      if (selectedTool === 'annotation') {
        await addTextAnnotation(pendingEdit.x, pendingEdit.y);
      } else if (selectedTool === 'text') {
        await addTextInsertion(pendingEdit.x, pendingEdit.y);
      }
    } catch (error) {
      console.error('Failed to add edit:', error);
    }
  };

  // 編集状態の確認
  const isModified = pdfProcessor ? pdfProcessor.is_modified() : false;

  return (
    <div className="App">
      <header className="App-header">
        <h1>PDF Editor</h1>
        <p>WebAssemblyを使用したブラウザ内PDF編集ツール</p>
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
          <PdfViewer
            pdfFile={pdfFile}
            pdfInfo={pdfInfo}
            pdfDataUrl={pdfDataUrl}
            viewMode={viewMode}
            currentPage={currentPage}
            textInsertions={textInsertions}
            onPageChange={setCurrentPage}
            onToggleEditMode={toggleEditMode}
            onReset={handleReset}
          >
            <EditOverlay
              viewMode={viewMode}
              selectedTool={selectedTool}
              onOverlayClick={handleOverlayClick}
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
        ) : null}

        {viewMode === 'edit' && pdfProcessor && (
          <EditToolbar
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
            textInput={textInput}
            onTextInputChange={setTextInput}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            textColor={textColor}
            onTextColorChange={setTextColor}
            fontFamily={fontFamily}
            onFontFamilyChange={setFontFamily}
            annotations={annotations}
            textInsertions={textInsertions}
            onRemoveAnnotation={removeAnnotation}
            onRemoveTextInsertion={removeTextInsertion}
            onClearAllEdits={clearAllEdits}
            onSave={handleSave}
            isModified={isModified}
          />
        )}
      </main>
    </div>
  );
}

export default App;
