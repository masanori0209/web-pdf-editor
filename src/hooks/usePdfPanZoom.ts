import { useCallback, useEffect, useRef } from 'react';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;

type PanState = {
  pointerId: number;
  startX: number;
  startY: number;
  scrollLeft: number;
  scrollTop: number;
};

interface UsePdfPanZoomOptions {
  viewportRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  panEnabled: boolean;
  resetKey: string;
}

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function usePdfPanZoom({
  viewportRef,
  zoom,
  setZoom,
  panEnabled,
  resetKey,
}: UsePdfPanZoomOptions) {
  const spacePressedRef = useRef(false);
  const panStateRef = useRef<PanState | null>(null);
  const pinchStateRef = useRef<{ distance: number; zoom: number } | null>(null);

  const centerScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const stage = viewport.querySelector('.pdf-stage') as HTMLElement | null;
    if (!stage) return;

    viewport.scrollLeft = Math.max(0, (stage.offsetWidth - viewport.clientWidth) / 2);
    viewport.scrollTop = Math.max(0, (stage.offsetHeight - viewport.clientHeight) / 2);
  }, [viewportRef]);

  useEffect(() => {
    centerScroll();
  }, [resetKey, centerScroll]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.target instanceof HTMLInputElement) {
        return;
      }
      event.preventDefault();
      spacePressedRef.current = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        spacePressedRef.current = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const canStartPan = (event: PointerEvent) => {
      if (event.button === 1) return true;
      if (event.button !== 0) return false;
      if (spacePressedRef.current) return true;
      return panEnabled;
    };

    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest('.text-input-popup')) {
        return;
      }
      if (!canStartPan(event)) return;

      panStateRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
      };
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-panning');
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      const pan = panStateRef.current;
      if (!pan || pan.pointerId !== event.pointerId) return;

      viewport.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
      viewport.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
    };

    const endPan = (event: PointerEvent) => {
      const pan = panStateRef.current;
      if (!pan || pan.pointerId !== event.pointerId) return;

      panStateRef.current = null;
      viewport.classList.remove('is-panning');
      try {
        viewport.releasePointerCapture(event.pointerId);
      } catch {
        // ignore if capture was already released
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) return;

      event.preventDefault();
      const factor = 1 - event.deltaY * 0.002;
      setZoom((current) => clampZoom(current * factor));
    };

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 2) return;

      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      pinchStateRef.current = {
        distance: Math.hypot(dx, dy),
        zoom,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const pinch = pinchStateRef.current;
      if (!pinch || event.touches.length !== 2) return;

      event.preventDefault();
      const dx = event.touches[0].clientX - event.touches[1].clientX;
      const dy = event.touches[0].clientY - event.touches[1].clientY;
      const distance = Math.hypot(dx, dy);
      const ratio = distance / pinch.distance;
      setZoom(clampZoom(pinch.zoom * ratio));
    };

    const onTouchEnd = () => {
      pinchStateRef.current = null;
    };

    viewport.addEventListener('pointerdown', onPointerDown);
    viewport.addEventListener('pointermove', onPointerMove);
    viewport.addEventListener('pointerup', endPan);
    viewport.addEventListener('pointercancel', endPan);
    viewport.addEventListener('wheel', onWheel, { passive: false });
    viewport.addEventListener('touchstart', onTouchStart, { passive: true });
    viewport.addEventListener('touchmove', onTouchMove, { passive: false });
    viewport.addEventListener('touchend', onTouchEnd);
    viewport.addEventListener('touchcancel', onTouchEnd);

    return () => {
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', endPan);
      viewport.removeEventListener('pointercancel', endPan);
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('touchstart', onTouchStart);
      viewport.removeEventListener('touchmove', onTouchMove);
      viewport.removeEventListener('touchend', onTouchEnd);
      viewport.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [viewportRef, panEnabled, zoom, setZoom]);

  return { centerScroll, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM };
}
