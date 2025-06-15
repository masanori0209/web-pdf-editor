import React from 'react';
import type { EditTool, TextAnnotation, TextInsertion } from '../types/pdf';

interface EditToolbarProps {
  selectedTool: EditTool;
  onToolSelect: (tool: EditTool) => void;
  textInput: string;
  onTextInputChange: (value: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  textColor: string;
  onTextColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
  annotations: TextAnnotation[];
  textInsertions: TextInsertion[];
  onRemoveAnnotation: (index: number) => void;
  onRemoveTextInsertion: (index: number) => void;
  onClearAllEdits: () => void;
  onSave: () => void;
  isModified: boolean;
}

export const EditToolbar: React.FC<EditToolbarProps> = ({
  selectedTool,
  onToolSelect,
  textInput,
  onTextInputChange,
  fontSize,
  onFontSizeChange,
  textColor,
  onTextColorChange,
  fontFamily,
  onFontFamilyChange,
  annotations,
  textInsertions,
  onRemoveAnnotation,
  onRemoveTextInsertion,
  onClearAllEdits,
  onSave,
  isModified,
}) => {
  return (
    <div className="edit-tools">
      <div className="tool-group">
        <h3>ツール</h3>
        <button
          className={`tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
          onClick={() => onToolSelect('select')}
        >
          🖱️ 選択
        </button>
        <button
          className={`tool-btn ${selectedTool === 'annotation' ? 'active' : ''}`}
          onClick={() => onToolSelect('annotation')}
        >
          📝 注釈
        </button>
        <button
          className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
          onClick={() => onToolSelect('text')}
        >
          ✏️ テキスト挿入
        </button>
      </div>

      {(selectedTool === 'annotation' || selectedTool === 'text') && (
        <div className="text-options">
          <h3>{selectedTool === 'annotation' ? '注釈設定' : 'テキスト設定'}</h3>
          <div className="option-group">
            <label>
              テキスト:
              <input
                type="text"
                value={textInput}
                onChange={(e) => onTextInputChange(e.target.value)}
                placeholder={selectedTool === 'annotation' ? '注釈テキスト' : '挿入するテキスト'}
              />
            </label>
          </div>
          <div className="option-group">
            <label>
              フォントサイズ:
              <input
                type="number"
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                min="8"
                max="72"
              />
            </label>
          </div>
          <div className="option-group">
            <label>
              色:
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
              />
            </label>
          </div>
          {selectedTool === 'text' && (
            <div className="option-group">
              <label>
                フォント:
                <select
                  value={fontFamily}
                  onChange={(e) => onFontFamilyChange(e.target.value)}
                >
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times-Roman">Times Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="edits-list">
        <h3>編集内容</h3>
        
        {annotations.length > 0 && (
          <div className="edit-category">
            <h4>注釈 ({annotations.length})</h4>
            <div className="edits-container">
              {annotations.map((annotation, index) => (
                <div key={index} className="edit-item">
                  <span>
                    📝 P{annotation.page}: "{annotation.text}"
                  </span>
                  <button
                    onClick={() => onRemoveAnnotation(index)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {textInsertions.length > 0 && (
          <div className="edit-category">
            <h4>テキスト挿入 ({textInsertions.length})</h4>
            <div className="edits-container">
              {textInsertions.map((insertion, index) => (
                <div key={index} className="edit-item">
                  <span>
                    ✏️ P{insertion.page}: "{insertion.text}" ({insertion.font_family})
                  </span>
                  <button
                    onClick={() => onRemoveTextInsertion(index)}
                    className="remove-btn"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(annotations.length > 0 || textInsertions.length > 0) && (
          <button onClick={onClearAllEdits} className="clear-all-btn">
            🗑️ 全て削除
          </button>
        )}
      </div>

      <div className="edit-actions">
        <button onClick={onSave} className="save-btn" disabled={!isModified}>
          💾 保存・ダウンロード
        </button>
      </div>
    </div>
  );
}; 