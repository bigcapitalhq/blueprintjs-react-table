import { useEffect } from 'react';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../types.ts';

export type FreezePinningOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  numFrozenColumns?: number;
  numFrozenRows?: number;
};

/**
 * Pins the leftmost `numFrozenColumns` columns to the logical "start" region
 * and the topmost `numFrozenRows` rows to the "top" region, mirroring
 * Blueprint's `numFrozenColumns`/`numFrozenRows` props.
 *
 * The pinning state is derived from the *current* column order and row model,
 * so freezing stays correct across column reordering and row sorting/filtering.
 * The hook is a no-op when both counts are zero.
 */
export function useFreezePinning<TData extends BP_RowData>({
  table,
  numFrozenColumns = 0,
  numFrozenRows = 0,
}: FreezePinningOptions<TData>) {
  const visibleLeafColumns = table.getVisibleLeafColumns();
  const rows = table.getRowModel().rows;

  useEffect(() => {
    const startIds = visibleLeafColumns
      .slice(0, numFrozenColumns)
      .map((column) => column.id);

    const currentStart = table.state.columnPinning?.start ?? [];
    const nextStart = startIds.join('\u0000');
    if (currentStart.join('\u0000') !== nextStart) {
      table.setColumnPinning({ start: startIds, end: table.state.columnPinning?.end ?? [] });
    }
  }, [numFrozenColumns, table, visibleLeafColumns]);

  useEffect(() => {
    const topIds = rows.slice(0, numFrozenRows).map((row) => row.id);

    const currentTop = table.state.rowPinning?.top ?? [];
    const nextTop = topIds.join('\u0000');
    if (currentTop.join('\u0000') !== nextTop) {
      table.setRowPinning({ top: topIds, bottom: table.state.rowPinning?.bottom ?? [] });
    }
  }, [numFrozenRows, table, rows]);
}