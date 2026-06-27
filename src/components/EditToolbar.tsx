import React from 'react';
import type { EditObject, EditTool, TextAnnotation, TextInsertion } from '../types/pdf';
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
  bold: boolean;
  onBoldChange: (enabled: boolean) => void;
  italic: boolean;
  onItalicChange: (enabled: boolean) => void;
  strikeThrough: boolean;
  onStrikeThroughChange: (enabled: boolean) => void;
  strokeColor: string;
  onStrokeColorChange: (color: string) => void;
  fillColor: string;
  onFillColorChange: (color: string) => void;
  fillEnabled: boolean;
  onFillEnabledChange: (enabled: boolean) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  annotations: TextAnnotation[];
  textInsertions: TextInsertion[];
  editObjects: EditObject[];
  selectedEditObjectId: string | null;
  onSelectEditObject: (id: string | null) => void;
  onUpdateSelectedEditObject: (patch: Partial<EditObject>) => void;
  onRemoveAnnotation: (index: number) => void;
  onRemoveTextInsertion: (index: number) => void;
  onRemoveEditObject: (id: string) => void;
  onClearAllEdits: () => void;
  onSave: () => void;
  isModified: boolean;
}

const TOOL_HINTS: Record<EditTool, string> = {
  select: 'PDF上をクリックしても編集は行われません。',
  annotation: 'PDF上をクリックして注釈テキストを入力します。',
  text: 'PDF上をクリックしてテキストを挿入します。',
  rectangle: 'ドラッグして四角形を追加します。',
  ellipse: 'ドラッグして円・楕円を追加します。',
  line: 'ドラッグして直線を追加します。',
  arrow: 'ドラッグして矢印を追加します。',
  callout: 'ドラッグして吹き出しを追加します。',
  slash: 'ドラッグして斜線を追加します。',
};

const SHAPE_LABELS: Record<EditObject['kind'], string> = {
  text: 'テキスト',
  rectangle: '四角',
  ellipse: '丸',
  line: '直線',
  arrow: '矢印',
  callout: '吹き出し',
  slash: '斜線',
};

const canEditShapeText = (kind: EditObject['kind']) =>
  kind === 'rectangle' || kind === 'ellipse' || kind === 'callout';

export const EditToolbar: React.FC<EditToolbarProps> = ({
  selectedTool,
  onToolSelect,
  fontSize,
  onFontSizeChange,
  textColor,
  onTextColorChange,
  fontFamily,
  onFontFamilyChange,
  bold,
  onBoldChange,
  italic,
  onItalicChange,
  strikeThrough,
  onStrikeThroughChange,
  strokeColor,
  onStrokeColorChange,
  fillColor,
  onFillColorChange,
  fillEnabled,
  onFillEnabledChange,
  strokeWidth,
  onStrokeWidthChange,
  opacity,
  onOpacityChange,
  annotations,
  textInsertions,
  editObjects,
  selectedEditObjectId,
  onSelectEditObject,
  onUpdateSelectedEditObject,
  onRemoveAnnotation,
  onRemoveTextInsertion,
  onRemoveEditObject,
  onClearAllEdits,
  onSave,
  isModified,
}) => {
  const selectedObject = editObjects.find((item) => item.id === selectedEditObjectId) ?? null;
  const textObjects = editObjects.filter((item) => item.kind === 'text');
  const shapeObjects = editObjects.filter((item) => item.kind !== 'text');
  const totalEditCount = annotations.length + textInsertions.length + editObjects.length;
  const activeTextColor = selectedObject ? selectedObject.color : textColor;
  const activeFontSize = selectedObject ? selectedObject.font_size : fontSize;
  const activeFontFamily = selectedObject ? selectedObject.font_family : fontFamily;
  const activeBold = selectedObject ? selectedObject.bold : bold;
  const activeItalic = selectedObject ? selectedObject.italic : italic;
  const activeStrike = selectedObject ? selectedObject.strike_through : strikeThrough;
  const activeStrokeColor = selectedObject ? selectedObject.stroke_color : strokeColor;
  const activeFillColor = selectedObject ? selectedObject.fill_color : fillColor;
  const activeFillEnabled = selectedObject ? selectedObject.fill_enabled : fillEnabled;
  const activeStrokeWidth = selectedObject ? selectedObject.stroke_width : strokeWidth;
  const activeOpacity = selectedObject ? selectedObject.opacity : opacity;
  const selectedObjectSupportsText = selectedObject
    ? selectedObject.kind === 'text' || canEditShapeText(selectedObject.kind)
    : false;
  const showTextOptions =
    selectedTool === 'annotation'
    || selectedTool === 'text'
    || selectedTool === 'callout'
    || selectedObjectSupportsText;
  const showShapeOptions =
    ['rectangle', 'ellipse', 'line', 'arrow', 'callout', 'slash'].includes(selectedTool)
    || (selectedObject && selectedObject.kind !== 'text');

  const updateTextColor = (color: string) => {
    if (selectedObject) onUpdateSelectedEditObject({ color });
    else onTextColorChange(color);
  };

  const updateFontSize = (size: number) => {
    if (selectedObject) onUpdateSelectedEditObject({ font_size: size });
    else onFontSizeChange(size);
  };

  const updateFontFamily = (family: string) => {
    if (selectedObject) onUpdateSelectedEditObject({ font_family: family });
    else onFontFamilyChange(family);
  };

  const updateBold = (enabled: boolean) => {
    if (selectedObject) onUpdateSelectedEditObject({ bold: enabled });
    else onBoldChange(enabled);
  };

  const updateItalic = (enabled: boolean) => {
    if (selectedObject) onUpdateSelectedEditObject({ italic: enabled });
    else onItalicChange(enabled);
  };

  const updateStrike = (enabled: boolean) => {
    if (selectedObject) onUpdateSelectedEditObject({ strike_through: enabled });
    else onStrikeThroughChange(enabled);
  };

  const updateStrokeColor = (color: string) => {
    if (selectedObject) onUpdateSelectedEditObject({ stroke_color: color });
    else onStrokeColorChange(color);
  };

  const updateFillColor = (color: string) => {
    if (selectedObject) onUpdateSelectedEditObject({ fill_color: color });
    else onFillColorChange(color);
  };

  const updateFillEnabled = (enabled: boolean) => {
    if (selectedObject) onUpdateSelectedEditObject({ fill_enabled: enabled });
    else onFillEnabledChange(enabled);
  };

  const updateStrokeWidth = (width: number) => {
    if (selectedObject) onUpdateSelectedEditObject({ stroke_width: width });
    else onStrokeWidthChange(width);
  };

  const updateOpacity = (nextOpacity: number) => {
    const normalizedOpacity = Math.min(1, Math.max(0, nextOpacity));
    if (selectedObject) onUpdateSelectedEditObject({ opacity: normalizedOpacity });
    else onOpacityChange(normalizedOpacity);
  };

  return (
    <aside className="edit-tools" aria-label="編集ツール">
      <div className="tool-group">
        <h3>ツール</h3>
        <div className="segment-control" role="group" aria-label="ツール選択">
          <button
            type="button"
            className={`segment-btn ${selectedTool === 'select' ? 'active' : ''}`}
            onClick={() => onToolSelect('select')}
            aria-pressed={selectedTool === 'select'}
          >
            選択
          </button>
          <button
            type="button"
            className={`segment-btn ${selectedTool === 'annotation' ? 'active' : ''}`}
            onClick={() => onToolSelect('annotation')}
            aria-pressed={selectedTool === 'annotation'}
          >
            注釈
          </button>
          <button
            type="button"
            className={`segment-btn ${selectedTool === 'text' ? 'active' : ''}`}
            onClick={() => onToolSelect('text')}
            aria-pressed={selectedTool === 'text'}
          >
            テキスト挿入
          </button>
        </div>
        <div className="tool-grid" role="group" aria-label="図形ツール">
          {([
            ['rectangle', '四角'],
            ['ellipse', '丸'],
            ['line', '直線'],
            ['arrow', '矢印'],
            ['callout', '吹き出し'],
            ['slash', '斜線'],
          ] as const).map(([tool, label]) => (
            <button
              key={tool}
              type="button"
              className={`tool-chip ${selectedTool === tool ? 'active' : ''}`}
              onClick={() => onToolSelect(tool)}
              aria-pressed={selectedTool === tool}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="tool-hint">{TOOL_HINTS[selectedTool]}</p>
      </div>

      {selectedObject && (
        <div className="text-options">
          <h3>選択中</h3>
          <div className="selected-edit-summary">
            <span>{SHAPE_LABELS[selectedObject.kind]}</span>
            <button type="button" className="remove-btn" onClick={() => onRemoveEditObject(selectedObject.id)}>
              削除
            </button>
          </div>
          {selectedObjectSupportsText ? (
            <div className="option-group">
              <label htmlFor="selected-object-text">
                テキスト
                <input
                  id="selected-object-text"
                  type="text"
                  value={selectedObject.text}
                  onChange={(e) => onUpdateSelectedEditObject({ text: e.target.value })}
                />
              </label>
            </div>
          ) : null}
          <div className="position-grid" aria-label="位置とサイズ">
            <label htmlFor="selected-object-x">
              X
              <input
                id="selected-object-x"
                type="number"
                value={Math.round(selectedObject.x)}
                onChange={(e) => onUpdateSelectedEditObject({ x: Number(e.target.value) })}
              />
            </label>
            <label htmlFor="selected-object-y">
              Y
              <input
                id="selected-object-y"
                type="number"
                value={Math.round(selectedObject.y)}
                onChange={(e) => onUpdateSelectedEditObject({ y: Number(e.target.value) })}
              />
            </label>
            <label htmlFor="selected-object-width">
              幅
              <input
                id="selected-object-width"
                type="number"
                min="12"
                value={Math.round(selectedObject.width)}
                onChange={(e) => onUpdateSelectedEditObject({ width: Number(e.target.value) })}
              />
            </label>
            <label htmlFor="selected-object-height">
              高さ
              <input
                id="selected-object-height"
                type="number"
                min="12"
                value={Math.round(selectedObject.height)}
                onChange={(e) => onUpdateSelectedEditObject({ height: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}

      {showTextOptions && (
        <div className="text-options">
          <h3>{selectedTool === 'annotation' ? '注釈設定' : 'テキスト設定'}</h3>
          <div className="option-group">
            <label htmlFor="font-size">
              フォントサイズ
              <input
                id="font-size"
                type="number"
                value={activeFontSize}
                onChange={(e) => updateFontSize(Number(e.target.value))}
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
                value={activeTextColor}
                onChange={(e) => updateTextColor(e.target.value)}
              />
            </label>
          </div>
          <FontFamilySelect
            id="font-family"
            value={activeFontFamily}
            onChange={updateFontFamily}
          />
          <div className="toggle-row" role="group" aria-label="文字スタイル">
            <label>
              <input
                type="checkbox"
                checked={activeBold}
                onChange={(e) => updateBold(e.target.checked)}
              />
              太字
            </label>
            <label>
              <input
                type="checkbox"
                checked={activeItalic}
                onChange={(e) => updateItalic(e.target.checked)}
              />
              斜体
            </label>
            <label>
              <input
                type="checkbox"
                checked={activeStrike}
                onChange={(e) => updateStrike(e.target.checked)}
              />
              取り消し線
            </label>
          </div>
        </div>
      )}

      {showShapeOptions && (
        <div className="text-options">
          <h3>図形設定</h3>
          <div className="option-group">
            <label htmlFor="stroke-color">
              線の色
              <input
                id="stroke-color"
                type="color"
                value={activeStrokeColor}
                onChange={(e) => updateStrokeColor(e.target.value)}
              />
            </label>
          </div>
          <div className="option-group">
            <label htmlFor="stroke-width">
              線の太さ
              <input
                id="stroke-width"
                type="number"
                min="0"
                max="16"
                value={activeStrokeWidth}
                onChange={(e) => updateStrokeWidth(Number(e.target.value))}
              />
            </label>
          </div>
          <div className="option-group">
            <label htmlFor="shape-opacity">
              透過率
              <div className="range-row">
                <input
                  id="shape-opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(activeOpacity * 100)}
                  onChange={(e) => updateOpacity(Number(e.target.value) / 100)}
                />
                <span>{Math.round(activeOpacity * 100)}%</span>
              </div>
            </label>
          </div>
          <div className="toggle-row">
            <label>
              <input
                type="checkbox"
                checked={activeFillEnabled}
                onChange={(e) => updateFillEnabled(e.target.checked)}
              />
              背景色を使う
            </label>
          </div>
          <div className="option-group">
            <label htmlFor="fill-color">
              背景色
              <input
                id="fill-color"
                type="color"
                value={activeFillColor}
                onChange={(e) => updateFillColor(e.target.value)}
                disabled={!activeFillEnabled}
              />
            </label>
          </div>
        </div>
      )}

      <div className="edits-list">
        <h3>編集内容</h3>

        {totalEditCount === 0 && (
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

        {(textInsertions.length > 0 || textObjects.length > 0) && (
          <div className="edit-category">
            <h4>テキスト挿入 ({textInsertions.length + textObjects.length})</h4>
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
              {textObjects.map((editObject) => (
                <div
                  key={editObject.id}
                  className={`edit-item ${selectedEditObjectId === editObject.id ? 'is-selected' : ''}`}
                  onClick={() => onSelectEditObject(editObject.id)}
                >
                  <span>
                    P{editObject.page}: &quot;{editObject.text}&quot;
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEditObject(editObject.id);
                    }}
                    className="remove-btn"
                    aria-label={`テキスト ${editObject.text} を削除`}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {shapeObjects.length > 0 && (
          <div className="edit-category">
            <h4>図形 ({shapeObjects.length})</h4>
            <div className="edits-container">
              {shapeObjects.map((editObject) => (
                <div
                  key={editObject.id}
                  className={`edit-item ${selectedEditObjectId === editObject.id ? 'is-selected' : ''}`}
                  onClick={() => onSelectEditObject(editObject.id)}
                >
                  <span>
                    P{editObject.page}: {SHAPE_LABELS[editObject.kind]}
                    {editObject.text ? ` "${editObject.text}"` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveEditObject(editObject.id);
                    }}
                    className="remove-btn"
                    aria-label={`${SHAPE_LABELS[editObject.kind]} を削除`}
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {totalEditCount > 0 && (
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
