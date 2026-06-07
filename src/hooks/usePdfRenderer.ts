import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PageRenderMetrics } from '../lib/coordinates';
import { getPageRenderMetrics } from '../lib/coordinates';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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

  useEffect(() => {
    if (!pdfDataUrl || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;

    const renderPage = async () => {
      setRendering(true);
      setRenderError(null);

      try {
        const loadingTask = pdfjsLib.getDocument(pdfDataUrl);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1 });
        const container = containerRef.current!;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight || 700;
        const pageMetrics = getPageRenderMetrics(
          containerWidth,
          containerHeight,
          viewport.width,
          viewport.height,
          zoom,
        );

        const canvas = canvasRef.current!;
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Canvas context unavailable');
        }

        canvas.width = Math.floor(containerWidth);
        canvas.height = Math.floor(containerHeight);
        context.clearRect(0, 0, canvas.width, canvas.height);

        const renderViewport = page.getViewport({ scale: pageMetrics.scale });
        const transform: number[] = pageMetrics.offsetX !== 0 || pageMetrics.offsetY !== 0
          ? [1, 0, 0, 1, pageMetrics.offsetX, pageMetrics.offsetY]
          : [];

        await page.render({
          canvasContext: context,
          viewport: renderViewport,
          transform,
        }).promise;

        if (!cancelled) {
          setMetrics(pageMetrics);
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
