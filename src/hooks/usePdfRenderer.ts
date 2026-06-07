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
}

export function usePdfRenderer({ pdfDataUrl, currentPage, zoom }: UsePdfRendererOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<PageRenderMetrics | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [rendering, setRendering] = useState(false);

  const hasRenderedRef = useRef(false);

  useEffect(() => {
    if (!pdfDataUrl || !canvasRef.current || !containerRef.current) return;

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

        const container = containerRef.current!;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight || 700;
        const pageMetrics = getPageRenderMetrics(
          containerWidth,
          containerHeight,
          pageDimensions.width,
          pageDimensions.height,
          zoom,
        );

        const renderWidth = Math.floor(containerWidth);
        const renderHeight = Math.floor(containerHeight);
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
        context.putImageData(imageData, pageMetrics.offsetX, pageMetrics.offsetY);

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
  }, [pdfDataUrl, currentPage, zoom]);

  return {
    canvasRef,
    containerRef,
    metrics,
    renderError,
    rendering,
  };
}
