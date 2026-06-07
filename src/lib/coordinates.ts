export interface ScreenPoint {
  x: number;
  y: number;
}

export interface PageRenderMetrics {
  pageWidth: number;
  pageHeight: number;
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
}

export function getPageRenderMetrics(
  containerWidth: number,
  containerHeight: number,
  pageWidth: number,
  pageHeight: number,
  zoom = 1,
): PageRenderMetrics {
  const baseScale = Math.min(containerWidth / pageWidth, containerHeight / pageHeight);
  const scale = baseScale * zoom;
  const renderedWidth = pageWidth * scale;
  const renderedHeight = pageHeight * scale;

  return {
    pageWidth,
    pageHeight,
    scale,
    renderedWidth,
    renderedHeight,
  };
}

export function screenToPagePoint(
  clientX: number,
  clientY: number,
  stageRect: DOMRect,
  metrics: PageRenderMetrics,
): ScreenPoint {
  const localX = clientX - stageRect.left;
  const localY = clientY - stageRect.top;

  return {
    x: Math.max(0, Math.min(metrics.pageWidth, localX / metrics.scale)),
    y: Math.max(0, Math.min(metrics.pageHeight, localY / metrics.scale)),
  };
}

export function pageToScreenPoint(
  pageX: number,
  pageY: number,
  metrics: PageRenderMetrics,
): ScreenPoint {
  return {
    x: pageX * metrics.scale,
    y: pageY * metrics.scale,
  };
}
