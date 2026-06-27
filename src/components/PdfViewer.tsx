import React, { useRef, useState } from 'react';
import type { PdfInfo, TextInsertion, TextAnnotation, ViewMode, EditTool } from '../types/pdf';
import { usePdfRenderer } from '../hooks/usePdfRenderer';
import { usePdfPanZoom } from '../hooks/usePdfPanZoom';
import { pageToScreenPoint } from '../lib/coordinates';
import { getOverlayFontFamily } from '../lib/fonts';
import { PdfViewerMetricsProvider } from '../context/PdfViewerContext';

interface PdfViewerProps {
  pdfInfo: PdfInfo;
  pdfDataUrl: string;
  currentPage: number;
  viewMode: ViewMode;
  selectedTool: EditTool;
  textInsertions: TextInsertion[];
  annotations: TextAnnotation[];
  onPageChange: (page: number) => void;
  children?: React.ReactNode;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfInfo,
  pdfDataUrl,
  currentPage,
  textInsertions,
  annotations,
  onPageChange,
  children,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  const { canvasRef, metrics, renderError, rendering } = usePdfRenderer({
    pdfDataUrl,
    currentPage,
    zoom,
    viewportRef,
  });

  const { minZoom, maxZoom } = usePdfPanZoom({
    viewportRef,
    zoom,
    setZoom,
    panEnabled: false,
    resetKey: String(currentPage),
  });

  const renderOverlayItem = (
    item: TextAnnotation | TextInsertion,
    key: string,
    className: string,
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
        {item.text}
      </div>
    );
  };

  const stageStyle = metrics
    ? { width: metrics.renderedWidth, height: metrics.renderedHeight }
    : undefined;

  return (
    <div className="pdf-section">
      <div className="pdf-toolbar" aria-label="PDF操作">
        <div className="pdf-toolbar__group">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="btn btn--outline btn--icon"
            aria-label="前のページ"
          >
            ‹
          </button>
          <span className="pdf-toolbar__label" aria-live="polite">
            {currentPage} / {pdfInfo.page_count}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(pdfInfo.page_count, currentPage + 1))}
            disabled={currentPage >= pdfInfo.page_count}
            className="btn btn--outline btn--icon"
            aria-label="次のページ"
          >
            ›
          </button>
        </div>

        <div className="pdf-toolbar__group">
          <button
            type="button"
            className="btn btn--outline btn--icon"
            onClick={() => setZoom((z) => Math.max(minZoom, Math.round((z - 0.1) * 10) / 10))}
            aria-label="ズームアウト"
          >
            −
          </button>
          <span className="pdf-toolbar__label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="btn btn--outline btn--icon"
            onClick={() => setZoom((z) => Math.min(maxZoom, Math.round((z + 0.1) * 10) / 10))}
            aria-label="ズームイン"
          >
            +
          </button>
        </div>

        <p className="pdf-toolbar__hint">
          スクロールで移動 · Space/中ボタン+ドラッグ · Ctrl+ホイール / ピンチでズーム
        </p>
      </div>

      <div
        className="pdf-viewport"
        ref={viewportRef}
        data-testid={metrics ? 'pdf-viewer-ready' : 'pdf-viewer-loading'}
        aria-label="PDFプレビュー"
      >
        {rendering && !metrics && (
          <div className="pdf-loading" role="status" aria-live="polite">
            ページを読み込み中...
          </div>
        )}
        {renderError && <div className="pdf-render-error">{renderError}</div>}

        <div className="pdf-stage" style={stageStyle}>
          <canvas ref={canvasRef} className="pdf-canvas" />
          {annotations.map((annotation, index) =>
            renderOverlayItem(annotation, `annotation-${index}`, 'annotation-overlay'),
          )}
          {textInsertions.map((insertion, index) =>
            renderOverlayItem(insertion, `insertion-${index}`, 'text-insertion-overlay'),
          )}
          <PdfViewerMetricsProvider metrics={metrics}>
            {children}
          </PdfViewerMetricsProvider>
        </div>
      </div>
    </div>
  );
};
