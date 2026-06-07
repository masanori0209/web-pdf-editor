import React from 'react';
import type { ViewMode, EditTool } from '../types/pdf';
import { screenToPagePoint } from '../lib/coordinates';
import { usePdfViewerMetrics } from '../context/PdfViewerContext';

interface EditOverlayProps {
  viewMode: ViewMode;
  selectedTool: EditTool;
  onOverlayClick: (x: number, y: number) => void;
}

export const EditOverlay: React.FC<EditOverlayProps> = ({
  viewMode,
  selectedTool,
  onOverlayClick,
}) => {
  const metrics = usePdfViewerMetrics();

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'edit' || selectedTool === 'select' || !metrics) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pagePoint = screenToPagePoint(e.clientX, e.clientY, rect, metrics);
    onOverlayClick(pagePoint.x, pagePoint.y);
  };

  if (viewMode !== 'edit') return null;

  return (
    <div
      className={`pdf-overlay ${selectedTool !== 'select' ? 'clickable' : ''}`}
      onClick={handleClick}
      role="presentation"
      style={{
        cursor: selectedTool === 'select' ? 'default' : 'crosshair',
      }}
    />
  );
};
