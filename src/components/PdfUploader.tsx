import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface PdfUploaderProps {
  onFileSelect: (file: File) => void;
  loading: boolean;
  error: string | null;
  onReset: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onFileSelect,
  loading,
  error,
  onReset,
}) => {
  const [localError, setLocalError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setLocalError(null);
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const onDropRejected = useCallback(() => {
    setLocalError('PDFファイルを選択してください。');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const displayError = error ?? localError;

  if (loading) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <p>PDFを処理中...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="error" role="alert">
        <p>エラー: {displayError}</p>
        <button type="button" onClick={() => { setLocalError(null); onReset(); }} className="btn btn--outline">
          リセット
        </button>
      </div>
    );
  }

  return (
    <div className="upload-section">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        role="button"
        aria-label="PDFファイルをアップロード"
      >
        <input {...getInputProps()} aria-label="PDFファイル選択" />
        {isDragActive ? (
          <p>PDFファイルをここにドロップしてください...</p>
        ) : (
          <div>
            <p>PDFファイルをドラッグ&ドロップするか、クリックして選択してください</p>
            <p className="upload-hint">最大 25MB まで対応</p>
            <button type="button" className="upload-button">ファイルを選択</button>
          </div>
        )}
      </div>
    </div>
  );
};
