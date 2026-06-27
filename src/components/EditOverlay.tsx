import React, { useMemo, useRef, useState } from 'react';
import type { EditObject, EditObjectKind, ViewMode, EditTool } from '../types/pdf';
import { pageToScreenPoint, screenToPagePoint } from '../lib/coordinates';
import { getOverlayFontFamily } from '../lib/fonts';
import { usePdfViewerMetrics } from '../context/PdfViewerContext';

interface EditOverlayProps {
  viewMode: ViewMode;
  selectedTool: EditTool;
  currentPage: number;
  editObjects: EditObject[];
  selectedEditObjectId: string | null;
  onOverlayClick: (x: number, y: number) => void;
  onCreateEditObject: (
    kind: EditObjectKind,
    x: number,
    y: number,
    width?: number,
    height?: number,
  ) => void;
  onSelectEditObject: (id: string | null) => void;
  onUpdateEditObject: (editObject: EditObject) => void;
}

type DragState =
  | {
      mode: 'create';
      kind: EditObjectKind;
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    }
  | {
      mode: 'move' | 'resize';
      object: EditObject;
      startX: number;
      startY: number;
    };

const shapeToolToKind = (tool: EditTool): EditObjectKind | null => {
  if (
    tool === 'rectangle'
    || tool === 'ellipse'
    || tool === 'line'
    || tool === 'arrow'
    || tool === 'callout'
    || tool === 'slash'
  ) {
    return tool;
  }
  return null;
};

const getScreenBox = (editObject: EditObject, metrics: NonNullable<ReturnType<typeof usePdfViewerMetrics>>) => {
  const topLeft = pageToScreenPoint(editObject.x, editObject.y, metrics);
  const bottomRight = pageToScreenPoint(
    editObject.x + editObject.width,
    editObject.y + editObject.height,
    metrics,
  );
  const left = Math.min(topLeft.x, bottomRight.x);
  const top = Math.min(topLeft.y, bottomRight.y);
  const width = Math.abs(bottomRight.x - topLeft.x);
  const height = Math.abs(bottomRight.y - topLeft.y);
  return { left, top, width, height, x1: topLeft.x, y1: topLeft.y, x2: bottomRight.x, y2: bottomRight.y };
};

const calloutPoints = (box: { width: number; height: number }) => {
  const tailWidth = Math.min(box.width, 48) * 0.35;
  const tailX = box.width * 0.28;
  const tailHeight = Math.min(box.height, 24) * 0.55;
  return [
    [0, 0],
    [box.width, 0],
    [box.width, box.height],
    [tailX + tailWidth, box.height],
    [tailX + tailWidth * 0.45, box.height + tailHeight],
    [tailX, box.height],
    [0, box.height],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
};

const arrowHeadPoints = (x1: number, y1: number, x2: number, y2: number, size: number) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const ux = dx / length;
  const uy = dy / length;
  const px = -uy;
  const py = ux;
  return [
    [x2, y2],
    [x2 - ux * size + px * size * 0.55, y2 - uy * size + py * size * 0.55],
    [x2 - ux * size - px * size * 0.55, y2 - uy * size - py * size * 0.55],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
};

const getPageBox = (editObject: EditObject) => {
  const left = Math.min(editObject.x, editObject.x + editObject.width);
  const top = Math.min(editObject.y, editObject.y + editObject.height);
  const width = Math.abs(editObject.width);
  const height = Math.abs(editObject.height);
  return { left, top, width, height };
};

const pointHitsObject = (x: number, y: number, editObject: EditObject) => {
  const box = getPageBox(editObject);
  const padding = Math.max(6, editObject.stroke_width + 4);
  return (
    x >= box.left - padding
    && x <= box.left + box.width + padding
    && y >= box.top - padding
    && y <= box.top + box.height + padding
  );
};

const pointHitsResizeCorner = (x: number, y: number, editObject: EditObject) => {
  const box = getPageBox(editObject);
  return x >= box.left + box.width - 18 && y >= box.top + box.height - 18;
};

export const EditOverlay: React.FC<EditOverlayProps> = ({
  viewMode,
  selectedTool,
  currentPage,
  editObjects,
  selectedEditObjectId,
  onOverlayClick,
  onCreateEditObject,
  onSelectEditObject,
  onUpdateEditObject,
}) => {
  const metrics = usePdfViewerMetrics();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const shapeKind = shapeToolToKind(selectedTool);
  const canEdit = viewMode === 'edit';

  const objectsForPage = useMemo(
    () => editObjects.filter((item) => item.page === currentPage),
    [editObjects, currentPage],
  );

  if (!metrics) return null;

  const setActiveDragState = (nextState: DragState | null) => {
    dragStateRef.current = nextState;
    setDragState(nextState);
  };

  const getPagePoint = (e: React.PointerEvent<HTMLDivElement | SVGElement | HTMLSpanElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect() ?? e.currentTarget.getBoundingClientRect();
    return screenToPagePoint(e.clientX, e.clientY, rect, metrics);
  };

  const startBlankDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const point = getPagePoint(e);

    if (!canEdit) {
      return;
    }

    if (selectedTool === 'select') {
      const hitObject = [...objectsForPage]
        .reverse()
        .find((editObject) => pointHitsObject(point.x, point.y, editObject));
      if (hitObject) {
        onSelectEditObject(hitObject.id);
        e.currentTarget.setPointerCapture(e.pointerId);
        setActiveDragState({
          mode: pointHitsResizeCorner(point.x, point.y, hitObject) ? 'resize' : 'move',
          object: hitObject,
          startX: point.x,
          startY: point.y,
        });
      } else {
        onSelectEditObject(null);
      }
      return;
    }

    if (shapeKind) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setActiveDragState({
        mode: 'create',
        kind: shapeKind,
        startX: point.x,
        startY: point.y,
        currentX: point.x,
        currentY: point.y,
      });
      return;
    }

    onOverlayClick(point.x, point.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const activeDragState = dragStateRef.current;
    if (!activeDragState) return;
    const point = getPagePoint(e);

    if (activeDragState.mode === 'create') {
      setActiveDragState({ ...activeDragState, currentX: point.x, currentY: point.y });
      return;
    }

    const dx = point.x - activeDragState.startX;
    const dy = point.y - activeDragState.startY;
    const nextObject =
      activeDragState.mode === 'move'
        ? { ...activeDragState.object, x: activeDragState.object.x + dx, y: activeDragState.object.y + dy }
        : {
            ...activeDragState.object,
            width: Math.max(12, activeDragState.object.width + dx),
            height: Math.max(12, activeDragState.object.height + dy),
          };

    onUpdateEditObject(nextObject);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const activeDragState = dragStateRef.current;
    if (!activeDragState) return;

    if (activeDragState.mode === 'create') {
      const width = activeDragState.currentX - activeDragState.startX;
      const height = activeDragState.currentY - activeDragState.startY;
      if (Math.abs(width) < 6 && Math.abs(height) < 6) {
        onOverlayClick(activeDragState.startX, activeDragState.startY);
      } else {
        onCreateEditObject(activeDragState.kind, activeDragState.startX, activeDragState.startY, width, height);
      }
    }

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setActiveDragState(null);
  };

  const startObjectDrag = (
    e: React.PointerEvent<SVGElement | HTMLDivElement | HTMLSpanElement>,
    editObject: EditObject,
    mode: 'move' | 'resize',
  ) => {
    if (!canEdit || selectedTool !== 'select') return;
    e.stopPropagation();
    const point = getPagePoint(e);
    const box = getScreenBox(editObject, metrics);
    const isNearResizeCorner =
      e.clientX >= box.left + box.width - 18
      && e.clientY >= box.top + box.height - 18;
    const effectiveMode = mode === 'move' && isNearResizeCorner ? 'resize' : mode;
    onSelectEditObject(editObject.id);
    overlayRef.current?.setPointerCapture(e.pointerId);
    setActiveDragState({ mode: effectiveMode, object: editObject, startX: point.x, startY: point.y });
  };

  const renderDraft = () => {
    if (!dragState || dragState.mode !== 'create') return null;
    const draft: EditObject = {
      id: 'draft',
      page: currentPage,
      kind: dragState.kind,
      x: dragState.startX,
      y: dragState.startY,
      width: dragState.currentX - dragState.startX,
      height: dragState.currentY - dragState.startY,
      text: '',
      font_size: 12,
      color: '#000000',
      font_family: 'Noto Sans JP',
      bold: false,
      italic: false,
      strike_through: false,
      stroke_color: '#2563eb',
      fill_color: '#eff6ff',
      fill_enabled: false,
      stroke_width: 2,
    };
    return renderSvgObject(draft, true);
  };

  const renderSvgObject = (editObject: EditObject, draft = false) => {
    const box = getScreenBox(editObject, metrics);
    const selected = editObject.id === selectedEditObjectId && canEdit && !draft;
    const strokeWidth = Math.max(1, editObject.stroke_width * metrics.scale);
    const fill = editObject.fill_enabled ? editObject.fill_color : 'transparent';
    const opacity = editObject.fill_enabled ? 0.35 : 1;

    if (editObject.kind === 'text') return null;

    return (
      <g
        key={editObject.id}
        className={`edit-object-svg-item ${selected ? 'is-selected' : ''}`}
        pointerEvents="all"
        onPointerDown={(e) => startObjectDrag(e, editObject, 'move')}
      >
        {editObject.kind === 'rectangle' && (
          <rect
            x={box.left}
            y={box.top}
            width={box.width}
            height={box.height}
            fill={fill}
            fillOpacity={opacity}
            stroke={editObject.stroke_color}
            strokeWidth={strokeWidth}
          />
        )}
        {editObject.kind === 'ellipse' && (
          <ellipse
            cx={box.left + box.width / 2}
            cy={box.top + box.height / 2}
            rx={box.width / 2}
            ry={box.height / 2}
            fill={fill}
            fillOpacity={opacity}
            stroke={editObject.stroke_color}
            strokeWidth={strokeWidth}
          />
        )}
        {(editObject.kind === 'line' || editObject.kind === 'arrow') && (
          <>
            <line
              x1={box.x1}
              y1={box.y1}
              x2={box.x2}
              y2={box.y2}
              stroke={editObject.stroke_color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {editObject.kind === 'arrow' && (
              <polygon
                points={arrowHeadPoints(box.x1, box.y1, box.x2, box.y2, 10 + strokeWidth * 2)}
                fill={editObject.stroke_color}
              />
            )}
          </>
        )}
        {editObject.kind === 'slash' && (
          <line
            x1={box.left}
            y1={box.top + box.height}
            x2={box.left + box.width}
            y2={box.top}
            stroke={editObject.stroke_color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        )}
        {editObject.kind === 'callout' && (
          <g transform={`translate(${box.left} ${box.top})`}>
            <polygon
              points={calloutPoints(box)}
              fill={fill}
              fillOpacity={opacity}
              stroke={editObject.stroke_color}
              strokeWidth={strokeWidth}
            />
            <text
              x={8 * metrics.scale}
              y={(8 + editObject.font_size) * metrics.scale}
              fill={editObject.color}
              fontFamily={getOverlayFontFamily(editObject.font_family)}
              fontSize={editObject.font_size * metrics.scale}
              fontWeight={editObject.bold ? 700 : 400}
              fontStyle={editObject.italic ? 'italic' : 'normal'}
              textDecoration={editObject.strike_through ? 'line-through' : 'none'}
            >
              {editObject.text}
            </text>
          </g>
        )}
        {selected && (
          <>
            <rect
              className="edit-object-selection"
              x={box.left}
              y={box.top}
              width={box.width}
              height={box.height}
            />
            <rect
              className="edit-object-handle"
              x={box.left + box.width - 5}
              y={box.top + box.height - 5}
              width={10}
              height={10}
              onPointerDownCapture={(e) => startObjectDrag(e, editObject, 'resize')}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </>
        )}
      </g>
    );
  };

  const renderTextObject = (editObject: EditObject) => {
    if (editObject.kind !== 'text') return null;
    const box = getScreenBox(editObject, metrics);
    const selected = editObject.id === selectedEditObjectId && canEdit;

    return (
      <div
        key={editObject.id}
        className={`text-insertion-overlay edit-object-text ${selected ? 'is-selected' : ''}`}
        style={{
          left: box.left,
          top: box.top,
          minWidth: box.width,
          minHeight: box.height,
          fontSize: editObject.font_size * metrics.scale,
          color: editObject.color,
          fontFamily: getOverlayFontFamily(editObject.font_family),
          fontWeight: editObject.bold ? 700 : 400,
          fontStyle: editObject.italic ? 'italic' : 'normal',
          textDecoration: editObject.strike_through ? 'line-through' : 'none',
          pointerEvents: canEdit && selectedTool === 'select' ? 'auto' : 'none',
        }}
        onPointerDown={(e) => startObjectDrag(e, editObject, 'move')}
      >
        {editObject.text}
        {selected && (
          <span
            className="edit-object-text-handle"
            onPointerDownCapture={(e) => startObjectDrag(e, editObject, 'resize')}
            onPointerDown={(e) => e.stopPropagation()}
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      className={`pdf-overlay ${canEdit && selectedTool !== 'select' ? 'clickable' : ''}`}
      onPointerDown={startBlankDrag}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="presentation"
      style={{
        cursor: canEdit && selectedTool !== 'select' ? 'crosshair' : 'default',
        pointerEvents: canEdit ? 'auto' : 'none',
      }}
    >
      <svg className="edit-object-svg" width={metrics.renderedWidth} height={metrics.renderedHeight}>
        {objectsForPage.map((editObject) => renderSvgObject(editObject))}
        {renderDraft()}
      </svg>
      {objectsForPage.map((editObject) => renderTextObject(editObject))}
    </div>
  );
};
