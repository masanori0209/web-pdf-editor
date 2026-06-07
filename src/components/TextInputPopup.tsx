import React, { useEffect, useRef } from 'react';
import type { PendingEdit, EditTool } from '../types/pdf';
import { pageToScreenPoint } from '../lib/coordinates';
import { usePdfViewerMetrics } from '../context/PdfViewerContext';

interface TextInputPopupProps {
  isVisible: boolean;
  pendingEdit: PendingEdit | null;
  selectedTool: EditTool;
  textInput: string;
  onTextInputChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const TextInputPopup: React.FC<TextInputPopupProps> = ({
  isVisible,
  pendingEdit,
  selectedTool,
  textInput,
  onTextInputChange,
  onConfirm,
  onCancel,
}) => {
  const metrics = usePdfViewerMetrics();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) {
      inputRef.current?.focus();
    }
  }, [isVisible]);

  if (!isVisible || !pendingEdit || !metrics) return null;

  const screenPoint = pageToScreenPoint(pendingEdit.x, pendingEdit.y, metrics);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="text-input-popup"
      style={{
        left: screenPoint.x,
        top: screenPoint.y,
      }}
      role="dialog"
      aria-label={selectedTool === 'annotation' ? '注釈を追加' : 'テキストを挿入'}
    >
      <div className="popup-content">
        <h4>{selectedTool === 'annotation' ? '注釈を追加' : 'テキストを挿入'}</h4>
        <input
          ref={inputRef}
          type="text"
          value={textInput}
          onChange={(e) => onTextInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedTool === 'annotation'
              ? '注釈テキストを入力...'
              : '挿入するテキストを入力...'
          }
        />
        <div className="popup-actions">
          <button type="button" onClick={onConfirm} className="btn btn--primary">
            追加
          </button>
          <button type="button" onClick={onCancel} className="btn btn--outline">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
