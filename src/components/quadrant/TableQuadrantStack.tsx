import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { MutableRefObject, WheelEvent as ReactWheelEvent } from 'react';
import { TABLE_QUADRANT_STACK } from '../common/classes.ts';
import {
  getFrozenColumnsWidth,
  getFrozenRowCount,
  getFrozenRowsHeight,
} from '../common/pinning.ts';
import { TableSelectionContext } from '../common/table-selection-context.ts';
import { TableColumnReorderContext } from '../head/table-column-reorder-context.ts';
import { useColumnReorder } from '../../hooks/use-column-reorder.ts';
import {
  DEFAULT_OVERSCAN_ROW_COUNT,
  useRowVirtualizer,
  type BP_RowVirtualizer,
} from '../../hooks/use-row-virtualizer.ts';
import type { CellFocusSelectionApi } from '../../hooks/use-cell-focus-selection.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import { TableReorderGuides } from '../layers/TableReorderGuides.tsx';
import { TableResizeGuides } from '../layers/TableResizeGuides.tsx';
import { TableQuadrant } from './TableQuadrant.tsx';
import { QuadrantType } from './quadrant-type.ts';

export type TableQuadrantStackProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
  /** Effective (measured) height of the column-header area. */
  columnHeaderHeight: number;
  /** Ref to attach to the rendered TOP quadrant's column-header area. */
  columnHeaderMeasureRef: MutableRefObject<HTMLDivElement | null>;
  enableColumnReordering?: boolean;
  enableSorting?: boolean;
  areCellsLoading: boolean;
  areColumnHeadersLoading: boolean;
  areRowHeadersLoading: boolean;
  selection: CellFocusSelectionApi;
  rowResizing: RowResizingApi;
  ghosts?: BP_GhostCells;
  enableRowVirtualization?: boolean;
  overscanRowCount?: number;
  /** Ref to the main quadrant's scroll container (the interactive one). */
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  /** Width of the row-selection checkboxes column; `0` hides the column. */
  selectionColumnWidth?: number;
};

/**
 * The table's quadrant stack: four clipped quadrants (main, top, left,
 * top-left) overlaid on top of each other. Frozen columns and rows, the column
 * headers, and the row headers are rendered by the frozen quadrants and stay in
 * place, while the main quadrant scrolls. The frozen quadrants' offsets follow
 * the main quadrant's scroll position, and wheel gestures over them are
 * forwarded to the main quadrant.
 */
export function TableQuadrantStack<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
  columnHeaderHeight,
  columnHeaderMeasureRef,
  enableColumnReordering = false,
  enableSorting = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
  selection,
  rowResizing,
  ghosts,
  enableRowVirtualization,
  overscanRowCount,
  scrollContainerRef,
  selectionColumnWidth = 0,
}: TableQuadrantStackProps<TData>) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const topScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const leftScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topLeftScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const frozenColumnsWidth = getFrozenColumnsWidth(table);
  const frozenRowCount = getFrozenRowCount(table);
  const frozenRowsHeight = getFrozenRowsHeight(table, rowResizing.getRowHeight);
  // The row numbers and, when enabled, the row-selection checkboxes column form
  // the frozen chrome to the left of the table's columns.
  const chromeWidth = rowHeaderWidth + selectionColumnWidth;

  const rowVirtualizer: BP_RowVirtualizer | undefined = useRowVirtualizer({
    table,
    columnHeaderHeight,
    frozenRowCount,
    frozenRowsHeight,
    getRowHeight: rowResizing.getRowHeight,
    scrollContainerRef,
    enableRowVirtualization: enableRowVirtualization ?? false,
    overscanRowCount: overscanRowCount ?? DEFAULT_OVERSCAN_ROW_COUNT,
  });

  const { contextValue, guideIndex, reorderingColumnId } = useColumnReorder(
    table,
    enableColumnReordering,
    gridRef,
    scrollContainerRef,
    chromeWidth,
  );

  // The scroll offsets are only needed for the resize/reorder guides, which
  // live at the stack level and must account for scrolling. They are only
  // stored in state while a guide is active, so ordinary scrolling does not
  // re-render the table.
  const [scrollOffset, setScrollOffset] = useState({ left: 0, top: 0 });
  const columnResizing = table.state.columnResizing;
  const isColumnResizeActive =
    columnResizing?.isResizingColumn != null && columnResizing.isResizingColumn !== false;
  const isRowResizeActive = rowResizing.resizingGuideTop != null;
  const isReorderingActive = reorderingColumnId != null;
  const guidesActiveRef = useRef(false);
  guidesActiveRef.current = isColumnResizeActive || isRowResizeActive || isReorderingActive;

  const [scrollBarThickness, setScrollBarThickness] = useState({ vertical: 0, horizontal: 0 });

  const syncFrozenQuadrantScrollOffsets = useCallback(() => {
    const main = scrollContainerRef.current;
    if (main == null) {
      return;
    }
    if (topScrollContainerRef.current != null) {
      topScrollContainerRef.current.scrollLeft = main.scrollLeft;
    }
    if (leftScrollContainerRef.current != null) {
      leftScrollContainerRef.current.scrollTop = main.scrollTop;
    }
    if (topLeftScrollContainerRef.current != null) {
      topLeftScrollContainerRef.current.scrollLeft = 0;
      topLeftScrollContainerRef.current.scrollTop = 0;
    }
  }, [scrollContainerRef]);

  const handleMainScroll = useCallback(() => {
    syncFrozenQuadrantScrollOffsets();
    if (guidesActiveRef.current) {
      const main = scrollContainerRef.current;
      if (main != null) {
        setScrollOffset({ left: main.scrollLeft, top: main.scrollTop });
      }
    }
  }, [scrollContainerRef, syncFrozenQuadrantScrollOffsets]);

  const measureScrollBars = useCallback(() => {
    const main = scrollContainerRef.current;
    if (main == null) {
      return;
    }
    const vertical = Math.max(0, main.offsetWidth - main.clientWidth);
    const horizontal = Math.max(0, main.offsetHeight - main.clientHeight);
    setScrollBarThickness((previous) =>
      previous.vertical === vertical && previous.horizontal === horizontal
        ? previous
        : { vertical, horizontal },
    );
  }, [scrollContainerRef]);

  const totalColumnsWidth = table.getTotalSize();

  useLayoutEffect(() => {
    const main = scrollContainerRef.current;
    if (main == null) {
      return;
    }
    measureScrollBars();
    const observer = new ResizeObserver(measureScrollBars);
    observer.observe(main);
    return () => observer.disconnect();
  }, [measureScrollBars, scrollContainerRef]);

  // Scrollbar visibility changes with the content size without resizing the
  // scroll container, so re-measure whenever the layout changes.
  useLayoutEffect(() => {
    measureScrollBars();
  }, [
    columnHeaderHeight,
    frozenColumnsWidth,
    frozenRowsHeight,
    measureScrollBars,
    rowResizing.totalHeight,
    totalColumnsWidth,
  ]);

  // Keep the frozen quadrants in sync after layout changes (e.g. frozen counts
  // or row heights changed while scrolled).
  useLayoutEffect(() => {
    syncFrozenQuadrantScrollOffsets();
  }, [columnHeaderHeight, frozenColumnsWidth, frozenRowsHeight, syncFrozenQuadrantScrollOffsets]);

  // Guides are positioned in the stack's coordinate space, so they need the
  // current scroll offsets. The offsets are captured when a guide becomes
  // active (not just while scrolling), otherwise a guide opened after a
  // programmatic scroll would be drawn at a stale position.
  useLayoutEffect(() => {
    if (!guidesActiveRef.current) {
      return;
    }
    const main = scrollContainerRef.current;
    if (main == null) {
      return;
    }
    const left = main.scrollLeft;
    const top = main.scrollTop;
    if (left !== scrollOffset.left || top !== scrollOffset.top) {
      setScrollOffset({ left, top });
    }
  }, [
    isColumnResizeActive,
    isReorderingActive,
    isRowResizeActive,
    scrollContainerRef,
    scrollOffset.left,
    scrollOffset.top,
  ]);

  // Frozen quadrants have hidden scrollbars, so route wheel gestures to the
  // main quadrant to keep every quadrant in sync.
  const handleFrozenQuadrantWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      const main = scrollContainerRef.current;
      if (main == null) {
        return;
      }
      const maxScrollLeft = Math.max(0, main.scrollWidth - main.clientWidth);
      const maxScrollTop = Math.max(0, main.scrollHeight - main.clientHeight);
      const nextScrollLeft = clamp(main.scrollLeft + event.deltaX, 0, maxScrollLeft);
      const nextScrollTop = clamp(main.scrollTop + event.deltaY, 0, maxScrollTop);
      if (nextScrollLeft !== main.scrollLeft) {
        main.scrollLeft = nextScrollLeft;
      }
      if (nextScrollTop !== main.scrollTop) {
        main.scrollTop = nextScrollTop;
      }
    },
    [scrollContainerRef],
  );

  const topQuadrantHeight = columnHeaderHeight + frozenRowsHeight;
  const leftQuadrantWidth = chromeWidth + frozenColumnsWidth;

  const baseQuadrantProps = {
    table,
    rowHeaderWidth,
    selectionColumnWidth,
    columnHeaderHeight,
    enableSorting,
    areCellsLoading,
    areColumnHeadersLoading,
    areRowHeadersLoading,
    rowResizing,
    rowVirtualizer,
    ghosts,
  };

  return (
    <div ref={gridRef} className={TABLE_QUADRANT_STACK}>
      <TableColumnReorderContext.Provider value={contextValue}>
        <TableSelectionContext.Provider value={selection}>
          <TableQuadrant
            {...baseQuadrantProps}
            quadrantType={QuadrantType.MAIN}
            scrollContainerRef={scrollContainerRef}
            onScroll={handleMainScroll}
          />
          <TableQuadrant
            {...baseQuadrantProps}
            quadrantType={QuadrantType.TOP}
            columnHeaderMeasureRef={columnHeaderMeasureRef}
            scrollContainerRef={topScrollContainerRef}
            onWheel={handleFrozenQuadrantWheel}
            style={{
              height: topQuadrantHeight,
              left: chromeWidth,
              right: scrollBarThickness.vertical,
            }}
          />
          <TableQuadrant
            {...baseQuadrantProps}
            quadrantType={QuadrantType.LEFT}
            scrollContainerRef={leftScrollContainerRef}
            onWheel={handleFrozenQuadrantWheel}
            style={{
              bottom: scrollBarThickness.horizontal,
              top: columnHeaderHeight,
              width: leftQuadrantWidth,
            }}
          />
          <TableQuadrant
            {...baseQuadrantProps}
            quadrantType={QuadrantType.TOP_LEFT}
            scrollContainerRef={topLeftScrollContainerRef}
            onWheel={handleFrozenQuadrantWheel}
            style={{ height: topQuadrantHeight, width: leftQuadrantWidth }}
          />
          <TableResizeGuides
            table={table}
            rowHeaderWidth={chromeWidth}
            columnHeaderHeight={columnHeaderHeight}
            scrollLeft={scrollOffset.left}
            scrollTop={scrollOffset.top}
            frozenRowCount={frozenRowCount}
            resizingGuideTop={rowResizing.resizingGuideTop}
            resizingRowIndex={rowResizing.resizingRowIndex}
          />
          <TableReorderGuides
            table={table}
            reorderingColumnId={reorderingColumnId}
            guideIndex={guideIndex}
            rowHeaderWidth={chromeWidth}
            scrollLeft={scrollOffset.left}
          />
        </TableSelectionContext.Provider>
      </TableColumnReorderContext.Provider>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
