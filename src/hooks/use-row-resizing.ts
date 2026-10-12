import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
} from 'react';

/** Minimum height a row can be resized to (mirrors Blueprint's MIN_ROW_HEIGHT). */
export const DEFAULT_MIN_ROW_HEIGHT = 6;
/** Maximum height a row can be resized to (mirrors Blueprint's MAX_ROW_HEIGHT). */
export const DEFAULT_MAX_ROW_HEIGHT = 100;

/** Event types emitted by the row header resize handle. */
export type RowResizeStartEvent = ReactMouseEvent<Element> | ReactTouchEvent<Element>;

/** Handler invoked when a resize drag starts from a row header's resize handle. */
export type RowResizeStartHandler = (index: number, event: RowResizeStartEvent) => void;

export type RowResizingOptions = {
  /** Default height for rows that don't have an explicit height. */
  rowHeight: number;
  /** Number of rows in the table. */
  rowCount: number;
  /**
   * Controlled per-row heights, indexed by row index. When provided, the
   * table's row heights are fully owned by the caller, who updates them via
   * `onRowHeightChanged`. Entries of `undefined` fall back to `rowHeight`.
   */
  rowHeights?: Array<number | undefined>;
  /** Initial per-row heights for the uncontrolled mode. */
  defaultRowHeights?: Array<number | undefined>;
  /**
   * If `true`, rows can be resized by dragging the horizontal handle at the
   * bottom of each row header.
   *
   * @default false
   */
  enableRowResizing?: boolean;
  /** Minimum height a row can be resized to. @default 6 */
  minRowHeight?: number;
  /** Maximum height a row can be resized to. @default 100 */
  maxRowHeight?: number;
  /**
   * Listener invoked whenever a row's height changes. Fires continuously
   * during a resize drag (and once more when it ends), in both the controlled
   * and uncontrolled modes.
   */
  onRowHeightChanged?: (index: number, height: number) => void;
};

export type RowResizingApi = {
  /** Whether row resizing is enabled. */
  enabled: boolean;
  /** Resolved height of the row at `index`. */
  getRowHeight: (index: number) => number;
  /** Resolved absolute top offset of the row at `index` within the body. */
  getRowTop: (index: number) => number;
  /** Total height of all rows combined. */
  totalHeight: number;
  /** Index of the row currently being resized, or `null`. */
  resizingRowIndex: number | null;
  /** Absolute top of the horizontal resize guide while resizing, or `null`. */
  resizingGuideTop: number | null;
  /** Begins resizing the row at `index`. Wire to the row header resize handle. */
  startRowResize: RowResizeStartHandler;
};

export function useRowResizing({
  rowHeight,
  rowCount,
  rowHeights,
  defaultRowHeights,
  enableRowResizing = false,
  minRowHeight = DEFAULT_MIN_ROW_HEIGHT,
  maxRowHeight = DEFAULT_MAX_ROW_HEIGHT,
  onRowHeightChanged,
}: RowResizingOptions): RowResizingApi {
  const isControlled = rowHeights != null;

  // Uncontrolled per-row heights, seeded from `defaultRowHeights`.
  const [internalRowHeights, setInternalRowHeights] = useState<Array<number | undefined>>(
    defaultRowHeights ?? [],
  );

  const [resizingRowIndex, setResizingRowIndex] = useState<number | null>(null);
  const [resizingGuideTop, setResizingGuideTop] = useState<number | null>(null);

  const dragInfoRef = useRef<{
    index: number;
    startY: number;
    startHeight: number;
    rowTop: number;
    min: number;
    max: number;
  } | null>(null);

  const getRowHeight = useCallback(
    (index: number) => {
      if (isControlled) {
        return rowHeights[index] ?? rowHeight;
      }
      return internalRowHeights[index] ?? defaultRowHeights?.[index] ?? rowHeight;
    },
    [defaultRowHeights, internalRowHeights, isControlled, rowHeight, rowHeights],
  );

  // Cumulative row offsets, recomputed whenever the resolved heights change.
  const { rowTops, totalHeight } = useMemo(() => {
    const tops = new Array<number>(rowCount);
    let top = 0;
    for (let i = 0; i < rowCount; i++) {
      tops[i] = top;
      top += getRowHeight(i);
    }
    return { rowTops: tops, totalHeight: top };
  }, [getRowHeight, rowCount]);

  const getRowTop = useCallback((index: number) => rowTops[index] ?? 0, [rowTops]);

  // Refs mirror the latest values so the window-level drag listeners can stay
  // stable for the entire lifetime of a drag (the same trick used by
  // `use-column-reorder`).
  const getRowHeightRef = useRef(getRowHeight);
  getRowHeightRef.current = getRowHeight;
  const rowTopsRef = useRef(rowTops);
  rowTopsRef.current = rowTops;
  const enabledRef = useRef(enableRowResizing);
  enabledRef.current = enableRowResizing;
  const isControlledRef = useRef(isControlled);
  isControlledRef.current = isControlled;
  const minRef = useRef(minRowHeight);
  minRef.current = minRowHeight;
  const maxRef = useRef(maxRowHeight);
  maxRef.current = maxRowHeight;
  const onRowHeightChangedRef = useRef(onRowHeightChanged);
  onRowHeightChangedRef.current = onRowHeightChanged;

  const handleDragMove = useCallback((event: MouseEvent | TouchEvent) => {
    const drag = dragInfoRef.current;
    if (drag == null) {
      return;
    }
    const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
    if (clientY == null) {
      return;
    }
    const nextHeight = Math.min(
      drag.max,
      Math.max(drag.min, drag.startHeight + (clientY - drag.startY)),
    );
    if (!isControlledRef.current) {
      setInternalRowHeights((prev) => {
        const next = prev.slice();
        next[drag.index] = nextHeight;
        return next;
      });
    }
    onRowHeightChangedRef.current?.(drag.index, nextHeight);
    setResizingGuideTop(drag.rowTop + nextHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragInfoRef.current = null;
    setResizingRowIndex(null);
    setResizingGuideTop(null);
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
    window.removeEventListener('touchcancel', handleDragEnd);
  }, [handleDragMove]);

  const startRowResize = useCallback<RowResizeStartHandler>((index, event) => {
    if (!enabledRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const clientY = 'touches' in event ? event.touches[0]?.clientY : event.clientY;
    if (clientY == null) {
      return;
    }
    const rowTop = rowTopsRef.current[index] ?? 0;
    const startHeight = getRowHeightRef.current(index);
    dragInfoRef.current = {
      index,
      startY: clientY,
      startHeight,
      rowTop,
      min: minRef.current,
      max: maxRef.current,
    };
    setResizingRowIndex(index);
    setResizingGuideTop(rowTop + startHeight);
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('touchend', handleDragEnd);
    window.addEventListener('touchcancel', handleDragEnd);
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
      window.removeEventListener('touchcancel', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  return {
    enabled: enableRowResizing,
    getRowHeight,
    getRowTop,
    totalHeight,
    resizingRowIndex,
    resizingGuideTop,
    startRowResize,
  };
}
