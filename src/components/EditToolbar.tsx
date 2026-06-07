import React from 'react';
import type { EditTool, TextAnnotation, TextInsertion } from '../types/pdf';
import { FontFamilySelect } from './FontFamilySelect';

interface EditToolbarProps {
  selectedTool: EditTool;
  onToolSelect: (tool: EditTool) => void;
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
    <aside className="edit-tools" aria-label="編集ツール">
      <div className="tool-group">
        <h3>ツール</h3>
        <div className="tool-buttons">
          <button
            type="button"
            className={`tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => onToolSelect('select')}
            aria-pressed={selectedTool === 'select'}
          >
            選択
          </button>
          <button
            type="button"
            className={`tool-btn ${selectedTool === 'annotation' ? 'active' : ''}`}
            onClick={() => onToolSelect('annotation')}
            aria-pressed={selectedTool === 'annotation'}
          >
            注釈
          </button>
          <button
            type="button"
            className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
            onClick={() => onToolSelect('text')}
            aria-pressed={selectedTool === 'text'}
          >
            テキスト挿入
          </button>
        </div>
        <p className="tool-hint">
          {selectedTool === 'select' && 'PDF上をクリックしても編集は行われません。'}
          {selectedTool === 'annotation' && 'PDF上をクリックして注釈テキストを入力します。'}
          {selectedTool === 'text' && 'PDF上をクリックしてテキストを挿入します。'}
        </p>
      </div>

      {(selectedTool === 'annotation' || selectedTool === 'text') && (
        <div className="text-options">
          <h3>{selectedTool === 'annotation' ? '注釈設定' : 'テキスト設定'}</h3>
          <div className="option-group">
            <label htmlFor="font-size">
              フォントサイズ
              <input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => onFontSizeChange(Number(e.target.value))}
                min="8"
                max="72"
              />
            </label>
          </div>
          <div className="option-group">
            <label htmlFor="text-color">
              色
              <input
                id="text-color"
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
              />
            </label>
          </div>
          <FontFamilySelect
            id="font-family"
            value={fontFamily}
            onChange={onFontFamilyChange}
          />
        </div>
      )}

      <div className="edits-list">
        <h3>編集内容</h3>

        {annotations.length === 0 && textInsertions.length === 0 && (
          <p className="empty-edits">まだ編集がありません</p>
        )}

        {annotations.length > 0 && (
          <div className="edit-category">
            <h4>注釈 ({annotations.length})</h4>
            <div className="edits-container">
              {annotations.map((annotation, index) => (
                <div key={`annotation-${annotation.page}-${index}`} className="edit-item">
                  <span>
                    P{annotation.page}: &quot;{annotation.text}&quot;
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveAnnotation(index)}
                    className="remove-btn"
                    aria-label={`注釈 ${annotation.text} を削除`}
                  >
                    削除
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
                <div key={`insertion-${insertion.page}-${index}`} className="edit-item">
                  <span>
                    P{insertion.page}: &quot;{insertion.text}&quot;
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveTextInsertion(index)}
                    className="remove-btn"
                    aria-label={`テキスト ${insertion.text} を削除`}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {(annotations.length > 0 || textInsertions.length > 0) && (
          <button type="button" onClick={onClearAllEdits} className="clear-all-btn">
            すべて削除
          </button>
        )}
      </div>

      <div className="edit-actions">
        <button type="button" onClick={onSave} className="save-btn" disabled={!isModified}>
          保存・ダウンロード
        </button>
      </div>
    </aside>
  );
};
