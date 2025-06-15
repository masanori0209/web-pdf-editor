import React from 'react';
import type { ViewMode, EditTool } from '../types/pdf';

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
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (viewMode !== 'edit' || selectedTool === 'select') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onOverlayClick(x, y);
  };

  if (viewMode !== 'edit') return null;

  return (
    <div
      className={`pdf-overlay ${selectedTool !== 'select' ? 'clickable' : ''}`}
      onClick={handleClick}
      style={{
        cursor: selectedTool === 'select' ? 'default' : 'crosshair',
      }}
    />
  );
}; 