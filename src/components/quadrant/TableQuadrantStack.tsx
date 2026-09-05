import { useRef, type MutableRefObject, type WheelEvent } from 'react';
import { TABLE_QUADRANT_STACK } from '../common/classes.ts';
import { TableSelectionContext } from '../common/table-selection-context.ts';
import { TableColumnReorderContext } from '../head/table-column-reorder-context.ts';
import { useColumnReorder } from '../../hooks/use-column-reorder.ts';
import { useRowVirtualizer, DEFAULT_OVERSCAN_ROW_COUNT, type RowVirtualizerOptions } from '../../hooks/use-row-virtualizer.ts';
import type { CellFocusSelectionApi } from '../../hooks/use-cell-focus-selection.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
  TableLoading,
} from '../../types.ts';
import type { TableLayout } from '../common/dimensions.ts';
import {
  getFrozenColumnsWidth,
  getFrozenRowsHeight,
} from '../common/pinning.ts';
import { TableQuadrant } from './TableQuadrant.tsx';
import { QuadrantType } from './quadrant-type.ts';

export type TableQuadrantStackProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> &
  TableLayout &
  TableLoading &
  Pick<
    RowVirtualizerOptions<TData>,
    'enableRowVirtualization' | 'overscanRowCount'
  > & {
    table: BP_TableInstance<TData>;
    enableColumnReordering?: boolean;
    enableSorting?: boolean;
    selection: CellFocusSelectionApi;
    /** Ref to the MAIN quadrant's scroll container. */
    scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
    /** Ref to the quadrant stack element; the grid's x/y origin. */
    gridRef: MutableRefObject<HTMLDivElement | null>;
  };

export function TableQuadrantStack<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  enableColumnReordering = false,
  enableSorting = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
  selection,
  scrollContainerRef,
  gridRef,
  enableRowVirtualization,
  overscanRowCount,
  ...restProps
}: TableQuadrantStackProps<TData>) {
  const topScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const leftScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const topLeftScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const rowVirtualizer = useRowVirtualizer({
    table,
    rowHeight,
    columnHeaderHeight,
    scrollContainerRef,
    enableRowVirtualization: enableRowVirtualization ?? false,
    overscanRowCount: overscanRowCount ?? DEFAULT_OVERSCAN_ROW_COUNT,
  });

  const { contextValue, guideIndex, reorderingColumnId } = useColumnReorder(
    table,
    enableColumnReordering,
    gridRef,
  );

  const handleMainScroll = () => {
    const main = scrollContainerRef.current;
    if (main == null) {
      return;
    }
    const { scrollLeft, scrollTop } = main;
    if (topScrollContainerRef.current != null) {
      topScrollContainerRef.current.scrollLeft = scrollLeft;
    }
    if (leftScrollContainerRef.current != null) {
      leftScrollContainerRef.current.scrollTop = scrollTop;
    }
    if (topLeftScrollContainerRef.current != null) {
      topLeftScrollContainerRef.current.scrollLeft = 0;
      topLeftScrollContainerRef.current.scrollTop = 0;
    }
  };

  // Frozen quadrants have hidden scrollbars, so route wheel gestures to the
  // MAIN quadrant to keep every quadrant in sync.
  const handleQuadrantWheel = (event: WheelEvent<HTMLDivElement>) => {
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
  };

  const frozenColumnsWidth = getFrozenColumnsWidth(table);
  const frozenRowsHeight = getFrozenRowsHeight(table, rowHeight);
  const leftQuadrantWidth = rowHeaderWidth + frozenColumnsWidth;
  const topQuadrantHeight = columnHeaderHeight + frozenRowsHeight;

  const baseProps = {
    table,
    rowHeight,
    rowHeaderWidth,
    columnHeaderHeight,
    enableSorting,
    areCellsLoading,
    areColumnHeadersLoading,
    areRowHeadersLoading,
    selection,
    rowVirtualizer,
    guideIndex,
    reorderingColumnId,
  };

  return (
    <div {...restProps} ref={gridRef} className={TABLE_QUADRANT_STACK}>
      <TableColumnReorderContext.Provider value={contextValue}>
        <TableSelectionContext.Provider value={selection}>
          <TableQuadrant
            {...baseProps}
            quadrantType={QuadrantType.MAIN}
            scrollContainerRef={scrollContainerRef}
            onScroll={handleMainScroll}
          />
          <TableQuadrant
            {...baseProps}
            quadrantType={QuadrantType.TOP}
            scrollContainerRef={topScrollContainerRef}
            onWheel={handleQuadrantWheel}
            style={{ height: topQuadrantHeight }}
          />
          <TableQuadrant
            {...baseProps}
            quadrantType={QuadrantType.LEFT}
            scrollContainerRef={leftScrollContainerRef}
            onWheel={handleQuadrantWheel}
            style={{ width: leftQuadrantWidth }}
          />
          <TableQuadrant
            {...baseProps}
            quadrantType={QuadrantType.TOP_LEFT}
            scrollContainerRef={topLeftScrollContainerRef}
            onWheel={handleQuadrantWheel}
            style={{ width: leftQuadrantWidth, height: topQuadrantHeight }}
          />
        </TableSelectionContext.Provider>
      </TableColumnReorderContext.Provider>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}