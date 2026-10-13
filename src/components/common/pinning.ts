import type { Column } from '@tanstack/react-table';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';

/**
 * A horizontal region of columns: frozen ("start") or scrollable ("center").
 *
 * `BP_Table` renders the frozen ("start") region in the left quadrants and the
 * scrollable ("center") region in the main/top quadrants. Columns pinned to
 * the logical "end" region are not supported and are excluded from both
 * regions, matching Blueprint's left-only frozen columns.
 */
export type ColumnRegion = 'start' | 'center';

/** A vertical region of rows: frozen ("top") or scrollable ("center"). */
export type RowRegion = 'top' | 'center';

/** Number of columns frozen to the logical "start" (left) region. */
export function getFrozenColumnCount<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
): number {
  return table.getStartVisibleLeafColumns().length;
}

/** Number of rows frozen to the "top" region. */
export function getFrozenRowCount<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
): number {
  return table.getTopRows().length;
}

/** Total pixel width of the frozen (start-pinned) columns. */
export function getFrozenColumnsWidth<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
): number {
  return table.getStartTotalSize();
}

/** Ordered visible leaf columns of a pinning region. */
export function getRegionColumns<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: ColumnRegion,
): Array<Column<BP_TableFeatures, TData, unknown>> {
  return region === 'start'
    ? table.getStartVisibleLeafColumns()
    : table.getCenterVisibleLeafColumns();
}

/** Total pixel width of a pinning region. */
export function getRegionWidth<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: ColumnRegion,
): number {
  return region === 'start' ? table.getStartTotalSize() : table.getCenterTotalSize();
}

/**
 * Offset of a column's leading edge in the table's display coordinate space,
 * where the frozen ("start") columns come first and the scrollable ("center")
 * columns follow, shifted by the horizontal scroll offset.
 */
export function getColumnDisplayOffset<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  column: Column<BP_TableFeatures, TData, unknown>,
  scrollLeft: number,
): number {
  if (column.getIsPinned() === 'start') {
    return column.getStart('start');
  }
  return getFrozenColumnsWidth(table) + column.getStart('center') - scrollLeft;
}

/** Pixel height of the frozen ("top") rows. */
export function getFrozenRowsHeight<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  getRowHeight: (index: number) => number,
): number {
  return sumRowHeights(0, getFrozenRowCount(table), getRowHeight);
}

function sumRowHeights(
  startIndex: number,
  endIndex: number,
  getRowHeight: (index: number) => number,
): number {
  let height = 0;
  for (let index = startIndex; index < endIndex; index++) {
    height += getRowHeight(index);
  }
  return height;
}

/**
 * Natural (visible leaf) index of the column that occupies the given
 * region-local offset, or `undefined` when the offset falls outside the
 * region. Used to map pointer positions back to column coordinates.
 */
export function getColumnIndexAtRegionOffset<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: ColumnRegion,
  offset: number,
): number | undefined {
  if (offset < 0) {
    return undefined;
  }
  let low = 0;
  const columns = getRegionColumns(table, region);
  let high = columns.length - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const column = columns[mid];
    const start = column.getStart(region);
    if (offset < start) {
      high = mid - 1;
      continue;
    }
    if (offset >= start + column.getSize()) {
      low = mid + 1;
      continue;
    }
    return column.getIndex();
  }
  return undefined;
}

/**
 * Absolute row index of the row that occupies the given region-local offset,
 * or `undefined` when the offset falls outside the region. Row offsets are
 * resolved through the (possibly variable) row heights, so this stays correct
 * while rows are being resized.
 */
export function getRowIndexAtRegionOffset<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: RowRegion,
  offset: number,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
): number | undefined {
  const frozenRowCount = getFrozenRowCount(table);
  const rowCount = table.getRowModel().rows.length;
  const start = region === 'top' ? 0 : frozenRowCount;
  const end = region === 'top' ? frozenRowCount : rowCount;
  if (offset < 0 || start >= end) {
    return undefined;
  }
  // Rows in a region are laid out back to back, so region-local offsets are
  // shared across all rows of a region; the region's first row anchors them.
  const regionTop = getRowTop(start);
  let low = start;
  let high = end - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const top = getRowTop(mid) - regionTop;
    if (offset < top) {
      high = mid - 1;
      continue;
    }
    if (offset >= top + getRowHeight(mid)) {
      low = mid + 1;
      continue;
    }
    return mid;
  }
  return undefined;
}
