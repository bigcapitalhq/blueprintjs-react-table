import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, type MutableRefObject } from 'react';
import type { BP_RowData, BP_TableInstance } from '../types.ts';

export const DEFAULT_OVERSCAN_ROW_COUNT = 5;

export type BP_RowVirtualizer = Virtualizer<HTMLDivElement, HTMLDivElement>;

export type RowVirtualizerOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  /** Effective height of the column-header area above the scrollable body. */
  columnHeaderHeight: number;
  /** Number of frozen rows rendered above the scrollable body. */
  frozenRowCount: number;
  /** Resolved height of the frozen rows rendered above the scrollable body. */
  frozenRowsHeight: number;
  /** Resolved height of the row at the given absolute index (used to estimate item sizes). */
  getRowHeight: (index: number) => number;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  enableRowVirtualization: boolean;
  overscanRowCount: number;
};

/**
 * Virtualizes the scrollable ("center") rows only. Frozen rows are always
 * rendered (they are expected to be few) and are excluded from the virtualizer,
 * so virtual item indices are offsets into the center rows; callers map them to
 * absolute row indices with `getFrozenRowCount`.
 */
export function useRowVirtualizer<TData extends BP_RowData>({
  table,
  columnHeaderHeight,
  frozenRowCount,
  frozenRowsHeight,
  getRowHeight,
  scrollContainerRef,
  enableRowVirtualization,
  overscanRowCount,
}: RowVirtualizerOptions<TData>): BP_RowVirtualizer | undefined {
  const centerRowCount = Math.max(0, table.getRowModel().rows.length - frozenRowCount);

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: centerRowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => getRowHeight(frozenRowCount + index),
    overscan: overscanRowCount,
    /**
     * The scrollable body sits below the column-header area and the frozen
     * rows inside the shared scroll container; this offset aligns virtual item
     * offsets with the absolute positioning used by body cells.
     */
    scrollMargin: columnHeaderHeight + frozenRowsHeight,
    enabled: enableRowVirtualization,
  });

  // Changing `estimateSize` alone does not invalidate the virtualizer's
  // memoized measurements, so item offsets would lag behind live row height
  // changes (e.g. during a resize drag) and frozen row count changes. Bump the
  // measurement cache whenever those change.
  useLayoutEffect(() => {
    virtualizer.measure();
  }, [frozenRowCount, getRowHeight, virtualizer]);

  return enableRowVirtualization ? virtualizer : undefined;
}
