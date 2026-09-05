import { useVirtualizer, type Virtualizer } from '@tanstack/react-virtual';
import type { MutableRefObject } from 'react';
import type { BP_RowData, BP_TableInstance } from '../types.ts';

export const DEFAULT_OVERSCAN_ROW_COUNT = 5;

export type BP_RowVirtualizer = Virtualizer<HTMLDivElement, HTMLDivElement>;

export type RowVirtualizerOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  columnHeaderHeight: number;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  enableRowVirtualization: boolean;
  overscanRowCount: number;
};

export function useRowVirtualizer<TData extends BP_RowData>({
  table,
  rowHeight,
  columnHeaderHeight,
  scrollContainerRef,
  enableRowVirtualization,
  overscanRowCount,
}: RowVirtualizerOptions<TData>): BP_RowVirtualizer | undefined {
  const rowCount = table.getRowModel().rows.length;

  const virtualizer = useVirtualizer<HTMLDivElement, HTMLDivElement>({
    count: rowCount,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => rowHeight,
    overscan: overscanRowCount,
    /**
     * The body sits below the column-header area inside the same shared
     * scroll container; this offset aligns virtual item offsets with the
     * absolute positioning used by body cells.
     */
    scrollMargin: columnHeaderHeight,
    enabled: enableRowVirtualization,
  });

  return enableRowVirtualization ? virtualizer : undefined;
}
