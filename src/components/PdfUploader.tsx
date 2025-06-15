import React from 'react';
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
  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  if (loading) {
    return (
      <div className="loading">
        <p>PDFを処理中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <p>エラー: {error}</p>
        <button onClick={onReset} className="reset-button">リセット</button>
      </div>
    );
  }

  return (
    <div className="upload-section">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>PDFファイルをここにドロップしてください...</p>
        ) : (
          <div>
            <p>PDFファイルをドラッグ&ドロップするか、クリックして選択してください</p>
            <button className="upload-button">ファイルを選択</button>
          </div>
        )}
      </div>
    </div>
  );
}; 