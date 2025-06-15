import React from 'react';
import type { PdfInfo, ViewMode, TextInsertion } from '../types/pdf';

interface PdfViewerProps {
  pdfFile: File;
  pdfInfo: PdfInfo;
  pdfDataUrl: string;
  viewMode: ViewMode;
  currentPage: number;
  textInsertions: TextInsertion[];
  onPageChange: (page: number) => void;
  onToggleEditMode: () => void;
  onReset: () => void;
  children?: React.ReactNode; // オーバーレイなど
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfFile,
  pdfInfo,
  pdfDataUrl,
  viewMode,
  currentPage,
  textInsertions,
  onPageChange,
  onToggleEditMode,
  onReset,
  children,
}) => {
  return (
    <div className="pdf-section">
      <div className="pdf-info">
        <h2>PDF情報</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>ファイル名:</strong> {pdfFile.name}
          </div>
          <div className="info-item">
            <strong>ページ数:</strong> {pdfInfo.page_count}
          </div>
          {pdfInfo.title && (
            <div className="info-item">
              <strong>タイトル:</strong> {pdfInfo.title}
            </div>
          )}
          {pdfInfo.author && (
            <div className="info-item">
              <strong>作成者:</strong> {pdfInfo.author}
            </div>
          )}
          {pdfInfo.subject && (
            <div className="info-item">
              <strong>件名:</strong> {pdfInfo.subject}
            </div>
          )}
          {pdfInfo.creator && (
            <div className="info-item">
              <strong>作成アプリ:</strong> {pdfInfo.creator}
            </div>
          )}
          {pdfInfo.producer && (
            <div className="info-item">
              <strong>PDF作成者:</strong> {pdfInfo.producer}
            </div>
          )}
          {pdfInfo.creation_date && (
            <div className="info-item">
              <strong>作成日:</strong> {pdfInfo.creation_date}
            </div>
          )}
          {pdfInfo.modification_date && (
            <div className="info-item">
              <strong>更新日:</strong> {pdfInfo.modification_date}
            </div>
          )}
        </div>

        <div className="pdf-actions">
          <button onClick={onToggleEditMode} className="edit-btn">
            {viewMode === 'view' ? '📝 編集モード' : '👁️ 表示モード'}
          </button>
          <button onClick={onReset} className="reset-button">
            🔄 別のファイル
          </button>
        </div>
      </div>

      <div className="pdf-preview">
        <div className="pdf-controls">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="page-btn"
          >
            ← 前のページ
          </button>
          <span className="page-info">
            {currentPage} / {pdfInfo.page_count}
          </span>
          <button
            onClick={() => onPageChange(Math.min(pdfInfo.page_count, currentPage + 1))}
            disabled={currentPage >= pdfInfo.page_count}
            className="page-btn"
          >
            次のページ →
          </button>
        </div>

        <div className="pdf-container">
          <iframe
            src={`${pdfDataUrl}#page=${currentPage}&toolbar=0&navpanes=0&scrollbar=0`}
            className="pdf-iframe"
            title="PDF Preview"
          />
          {/* テキスト挿入のオーバーレイ表示 */}
          {textInsertions
            .filter(insertion => insertion.page === currentPage)
            .map((insertion, index) => (
              <div
                key={index}
                className="text-insertion-overlay"
                style={{
                  position: 'absolute',
                  left: insertion.x,
                  top: insertion.y,
                  fontSize: insertion.font_size,
                  color: insertion.color,
                  fontFamily: insertion.font_family,
                  pointerEvents: 'none',
                  zIndex: 5,
                }}
              >
                {insertion.text}
              </div>
            ))}
          {children}
        </div>
      </div>
    </div>
  );
}; 