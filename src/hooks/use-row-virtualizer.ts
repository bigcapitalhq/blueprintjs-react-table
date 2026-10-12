import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, type MutableRefObject } from 'react';
import type { BP_RowData, BP_TableInstance } from '../types.ts';

export const DEFAULT_OVERSCAN_ROW_COUNT = 5;

export type BP_RowVirtualizer = Virtualizer<HTMLDivElement, HTMLDivElement>;

export type RowVirtualizerOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  columnHeaderHeight: number;
  /** Resolved height of the row at the given index (used to estimate item sizes). */
  getRowHeight: (index: number) => number;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  enableRowVirtualization: boolean;
  overscanRowCount: number;
};

export function useRowVirtualizer<TData extends BP_RowData>({
  table,
  columnHeaderHeight,
  getRowHeight,
  scrollContainerRef,
  enableRowVirtualization,
  overscanRowCount,
}: RowVirtualizerOptions<TData>): BP_RowVirtualizer | undefined {
  const rowCount = table.getRowModel().rows.length;

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: (index) => getRowHeight(index),
    overscan: overscanRowCount,
    /**
     * The body sits below the column-header area inside the same shared
     * scroll container; this offset aligns virtual item offsets with the
     * absolute positioning used by body cells.
     */
    scrollMargin: columnHeaderHeight,
    enabled: enableRowVirtualization,
  });

  // Changing `estimateSize` alone does not invalidate the virtualizer's
  // memoized measurements, so item offsets would lag behind live row height
  // changes (e.g. during a resize drag). Bump the measurement cache whenever
  // the resolved heights change.
  useLayoutEffect(() => {
    virtualizer.measure();
  }, [getRowHeight, virtualizer]);

  return enableRowVirtualization ? virtualizer : undefined;
}
