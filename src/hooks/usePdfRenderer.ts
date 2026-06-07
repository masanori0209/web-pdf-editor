import { useEffect, useRef, useState } from 'react';
import type { PageRenderMetrics } from '../lib/coordinates';
import { getPageRenderMetrics } from '../lib/coordinates';
import {
  fetchPdfBytes,
  initPdfEngine,
  wasm_get_page_dimensions,
  wasm_render_page,
} from '../lib/pdfProcessor';

interface UsePdfRendererOptions {
  pdfDataUrl: string | null;
  currentPage: number;
  zoom: number;
  viewportRef: React.RefObject<HTMLDivElement | null>;
}

export function usePdfRenderer({ pdfDataUrl, currentPage, zoom, viewportRef }: UsePdfRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<PageRenderMetrics | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  const hasRenderedRef = useRef(false);

  useEffect(() => {
    if (!pdfDataUrl || !canvasRef.current || !viewportRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      const isInitialRender = !hasRenderedRef.current;
      if (isInitialRender) {
        setRendering(true);
      }
      setRenderError(null);

      try {
        await initPdfEngine();
        const pdfBytes = await fetchPdfBytes(pdfDataUrl);
        const pageDimensions = wasm_get_page_dimensions(pdfBytes, currentPage - 1) as {
          width: number;
          height: number;
        };

        const viewport = viewportRef.current!;
        const containerWidth = viewport.clientWidth;
        const containerHeight = viewport.clientHeight;
        const pageMetrics = getPageRenderMetrics(
          containerWidth,
          containerHeight,
          pageDimensions.width,
          pageDimensions.height,
          zoom,
        );

        const renderWidth = Math.max(1, Math.floor(pageMetrics.renderedWidth));
        const renderHeight = Math.max(1, Math.floor(pageMetrics.renderedHeight));
        const imageData = wasm_render_page(
          pdfBytes,
          currentPage - 1,
          renderWidth,
          renderHeight,
        );

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas context unavailable');
        }

        canvas.width = renderWidth;
        canvas.height = renderHeight;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.putImageData(imageData, 0, 0);

        if (!cancelled) {
          setMetrics(pageMetrics);
          hasRenderedRef.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          console.error('PDF render error:', error);
          setRenderError(error instanceof Error ? error.message : 'PDFの描画に失敗しました');
        }
      } finally {
        if (!cancelled) {
          setRendering(false);
        }
      }
    };

    void renderPage();

    return () => {
      cancelled = true;
    };
  }, [pdfDataUrl, currentPage, zoom, viewportRef]);

  return {
    canvasRef,
    metrics,
    renderError,
    rendering,
  };
}
