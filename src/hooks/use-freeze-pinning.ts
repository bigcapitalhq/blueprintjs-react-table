import { useLayoutEffect } from 'react';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../types.ts';

export type FreezePinningOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  /**
   * Number of leftmost columns that should be frozen. The pinned column ids are
   * derived from the table's current visible leaf columns (in natural order),
   * so freezing stays correct across column reordering and column visibility.
   */
  numFrozenColumns: number;
  /**
   * Number of topmost rows that should be frozen. The pinned row ids are
   * derived from the table's current row model, so freezing follows sorting.
   */
  numFrozenRows: number;
};

/**
 * Derives TanStack's column/row pinning state from the `numFrozenColumns` /
 * `numFrozenRows` props, mirroring Blueprint's frozen columns and rows.
 *
 * The pinning state is the source of truth for the frozen regions (see
 * `pinning.ts`), so power users can also drive it directly through TanStack's
 * `columnPinning` / `rowPinning` state and `column.pin()` / `row.pin()` APIs.
 * The hook is a no-op when both counts match the current state.
 */
export function useFreezePinning<TData extends BP_RowData>({
  table,
  numFrozenColumns,
  numFrozenRows,
}: FreezePinningOptions<TData>) {
  const visibleLeafColumns = table.getVisibleLeafColumns();
  const rows = table.getRowModel().rows;

  // Layout effects run before the browser paints, so the frozen regions are
  // already pinned on the first painted frame.
  useLayoutEffect(() => {
    if (table.setColumnPinning == null) {
      return;
    }
    const startIds = visibleLeafColumns
      .slice(0, Math.max(0, numFrozenColumns))
      .map((column) => column.id);
    const currentStart = table.state.columnPinning?.start ?? [];
    if (!areIdsEqual(currentStart, startIds)) {
      table.setColumnPinning((previous) => ({ ...previous, start: startIds }));
    }
  }, [numFrozenColumns, table, visibleLeafColumns]);

  useLayoutEffect(() => {
    if (table.setRowPinning == null) {
      return;
    }
    const topIds = rows.slice(0, Math.max(0, numFrozenRows)).map((row) => row.id);
    const currentTop = table.state.rowPinning?.top ?? [];
    if (!areIdsEqual(currentTop, topIds)) {
      table.setRowPinning((previous) => ({ ...previous, top: topIds }));
    }
  }, [numFrozenRows, rows, table]);
}

function areIdsEqual(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
