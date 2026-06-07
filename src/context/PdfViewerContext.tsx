import React, { createContext, useContext } from 'react';
import type { PageRenderMetrics } from '../lib/coordinates';

const PdfViewerContext = createContext<PageRenderMetrics | null>(null);

export const PdfViewerMetricsProvider: React.FC<{
  metrics: PageRenderMetrics | null;
  children: React.ReactNode;
}> = ({ metrics, children }) => (
  <PdfViewerContext.Provider value={metrics}>{children}</PdfViewerContext.Provider>
);

export function usePdfViewerMetrics(): PageRenderMetrics | null {
  return useContext(PdfViewerContext);
}
