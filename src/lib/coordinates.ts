export interface ScreenPoint {
  x: number;
  y: number;
}

export interface PageRenderMetrics {
  pageWidth: number;
  pageHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
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
  const offsetX = (containerWidth - renderedWidth) / 2;
  const offsetY = (containerHeight - renderedHeight) / 2;

  return {
    pageWidth,
    pageHeight,
    scale,
    offsetX,
    offsetY,
  };
}

export function screenToPagePoint(
  clientX: number,
  clientY: number,
  containerRect: DOMRect,
  metrics: PageRenderMetrics,
): ScreenPoint {
  const localX = clientX - containerRect.left - metrics.offsetX;
  const localY = clientY - containerRect.top - metrics.offsetY;

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
    x: metrics.offsetX + pageX * metrics.scale,
    y: metrics.offsetY + pageY * metrics.scale,
  };
}
