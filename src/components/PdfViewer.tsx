import React, { useState } from 'react';
import type { PdfInfo, ViewMode, TextInsertion, TextAnnotation } from '../types/pdf';
import { usePdfRenderer } from '../hooks/usePdfRenderer';
import { pageToScreenPoint } from '../lib/coordinates';
import { getOverlayFontFamily } from '../lib/fonts';
import { PdfViewerMetricsProvider } from '../context/PdfViewerContext';

interface PdfViewerProps {
  pdfFile: File;
  pdfInfo: PdfInfo;
  pdfDataUrl: string;
  viewMode: ViewMode;
  currentPage: number;
  textInsertions: TextInsertion[];
  annotations: TextAnnotation[];
  onPageChange: (page: number) => void;
  onToggleEditMode: () => void;
  onReset: () => void;
  children?: React.ReactNode;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfFile,
  pdfInfo,
  pdfDataUrl,
  viewMode,
  currentPage,
  textInsertions,
  annotations,
  onPageChange,
  onToggleEditMode,
  onReset,
  children,
}) => {
  const [zoom, setZoom] = useState(1);
  const { canvasRef, containerRef, metrics, renderError, rendering } = usePdfRenderer({
    pdfDataUrl,
    currentPage,
    zoom,
  });

  const handleReset = () => {
    if (window.confirm('別のファイルを開きますか？未保存の編集内容は失われます。')) {
      onReset();
    }
  };

  const renderOverlayItem = (
    item: TextAnnotation | TextInsertion,
    key: string,
    className: string,
    prefix?: string,
  ) => {
    if (!metrics || item.page !== currentPage) return null;
    const screenPoint = pageToScreenPoint(item.x, item.y, metrics);

    return (
      <div
        key={key}
        className={className}
        style={{
          left: screenPoint.x,
          top: screenPoint.y,
          fontSize: item.font_size * metrics.scale,
          color: item.color,
          fontFamily: getOverlayFontFamily(item.font_family),
        }}
      >
        {prefix}
        {item.text}
      </div>
    );
  };

  return (
    <div className="pdf-section">
      <aside className="pdf-info">
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
        </div>

        <div className="pdf-actions">
          <button
            type="button"
            onClick={onToggleEditMode}
            className={`edit-btn ${viewMode === 'edit' ? 'active' : ''}`}
            aria-pressed={viewMode === 'edit'}
          >
            {viewMode === 'view' ? '編集モード' : '表示モード'}
          </button>
          <button type="button" onClick={handleReset} className="reset-button">
            別のファイル
          </button>
        </div>
      </aside>

      <section className="pdf-preview" aria-label="PDFプレビュー">
        <div className="pdf-controls">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="page-btn"
            aria-label="前のページ"
          >
            前へ
          </button>
          <span className="page-info" aria-live="polite">
            {currentPage} / {pdfInfo.page_count}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pdfInfo.page_count, currentPage + 1))}
            disabled={currentPage >= pdfInfo.page_count}
            className="page-btn"
            aria-label="次のページ"
          >
            次へ
          </button>
          <div className="zoom-controls">
            <button type="button" className="page-btn" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} aria-label="ズームアウト">−</button>
            <span className="page-info">{Math.round(zoom * 100)}%</span>
            <button type="button" className="page-btn" onClick={() => setZoom((z) => Math.min(2, z + 0.1))} aria-label="ズームイン">＋</button>
          </div>
        </div>

        <div
          className="pdf-container"
          ref={containerRef}
          data-testid={metrics ? 'pdf-viewer-ready' : 'pdf-viewer-loading'}
        >
          {rendering && !metrics && (
            <div className="pdf-loading" role="status" aria-live="polite">
              ページを読み込み中...
            </div>
          )}
          {renderError && <div className="pdf-render-error">{renderError}</div>}
          <canvas ref={canvasRef} className="pdf-canvas" />
          {annotations.map((annotation, index) =>
            renderOverlayItem(annotation, `annotation-${index}`, 'annotation-overlay', '📝 ')
          )}
          {textInsertions.map((insertion, index) =>
            renderOverlayItem(insertion, `insertion-${index}`, 'text-insertion-overlay')
          )}
          <PdfViewerMetricsProvider metrics={metrics}>
            {children}
          </PdfViewerMetricsProvider>
        </div>
      </section>
    </div>
  );
};
