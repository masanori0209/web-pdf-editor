import React from 'react';
import type { PendingEdit, EditTool } from '../types/pdf';

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
  if (!isVisible || !pendingEdit) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onConfirm();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div
      className="text-input-popup"
      style={{
        left: pendingEdit.x,
        top: pendingEdit.y,
      }}
    >
      <div className="popup-content">
        <h4>
          {selectedTool === 'annotation' ? '注釈を追加' : 'テキストを挿入'}
        </h4>
        <input
          type="text"
          value={textInput}
          onChange={(e) => onTextInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedTool === 'annotation' 
              ? '注釈テキストを入力...' 
              : '挿入するテキストを入力...'
          }
          autoFocus
        />
        <div className="popup-actions">
          <button onClick={onConfirm} className="confirm-btn">
            追加
          </button>
          <button onClick={onCancel} className="cancel-btn">
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
}; 