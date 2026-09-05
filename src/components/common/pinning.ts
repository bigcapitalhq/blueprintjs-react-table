import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

/** A horizontal region of columns: frozen ("start") or scrollable ("center"). */
export type ColumnRegion = 'start' | 'center';

/** A vertical region of rows: frozen ("top") or scrollable ("center"). */
export type RowRegion = 'top' | 'center';

/**
 * Helpers that read the TanStack column-pinning / row-pinning state to compute
 * the frozen regions of the table. The pinning features are the source of
 * truth for which columns/rows are frozen (see `useFreezePinning`).
 */

/** Number of columns frozen to the logical "start" (left) region. */
export function getFrozenColumnCount<TData extends BP_RowData>(table: BP_TableInstance<TData>): number {
  return table.getStartVisibleLeafColumns().length;
}

/** Number of rows frozen to the "top" region. */
export function getFrozenRowCount<TData extends BP_RowData>(table: BP_TableInstance<TData>): number {
  return table.getTopRows().length;
}

/** Total pixel width of the frozen (start-pinned) columns. */
export function getFrozenColumnsWidth<TData extends BP_RowData>(table: BP_TableInstance<TData>): number {
  return table.getStartTotalSize();
}

/** Total pixel height of the frozen (top-pinned) rows. */
export function getFrozenRowsHeight<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  rowHeight: number,
): number {
  return table.getTopRows().length * rowHeight;
}

/** Total pixel width of the scrollable (center) columns. */
export function getCenterColumnsWidth<TData extends BP_RowData>(table: BP_TableInstance<TData>): number {
  return table.getCenterTotalSize();
}

/** Total pixel height of the scrollable (center) rows. */
export function getCenterRowsHeight<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  rowHeight: number,
): number {
  return table.getCenterRows().length * rowHeight;
}

/**
 * Absolute x-offset of a logical column index within the full grid.
 *
 * `table.getVisibleLeafColumns()` preserves natural (definition/order) order,
 * but `column.getStart()` becomes relative to a pinning region once columns are
 * pinned. This maps a natural column index back to its absolute offset so
 * selection/focus overlays and scroll calculations stay correct.
 */
export function columnToPixelOffset<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  columnIndex: number,
): number {
  const columns = table.getVisibleLeafColumns();
  const column = columns[columnIndex];
  if (column == null) {
    return 0;
  }
  if (columnIndex < getFrozenColumnCount(table)) {
    return column.getStart('start');
  }
  return table.getStartTotalSize() + column.getStart('center');
}

/**
 * Inverse of `columnToPixelOffset`: given an x-offset relative to the full
 * grid, returns the logical column index whose cell occupies that point, or
 * `undefined` when the point falls outside the columns.
 */
export function columnFromPixelOffset<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  offsetLeft: number,
): number | undefined {
  const columns = table.getVisibleLeafColumns();
  for (let i = 0; i < columns.length; i++) {
    const start = columnToPixelOffset(table, i);
    const end = start + columns[i].getSize();
    if (offsetLeft >= start && offsetLeft < end) {
      return i;
    }
  }
  return undefined;
}

/**
 * Natural (logical) index of a column within `table.getVisibleLeafColumns()`.
 *
 * `column.getIndex()` becomes pinned-first once columns are pinned, so this
 * reverses that split for code that works with logical (grid) column indices.
 */
export function columnToNaturalIndex<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  column: { id: string },
): number {
  return table.getVisibleLeafColumns().findIndex((candidate) => candidate.id === column.id);
}