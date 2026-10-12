import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import type { CellCoordinates } from './region.ts';

/**
 * Binary-searches the cumulative row offsets to map a vertical offset
 * (relative to the top of the body) to a row index, or `-1` when the offset
 * falls outside the grid.
 */
function rowIndexAtOffset(
  offsetTop: number,
  rowCount: number,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
): number {
  if (offsetTop < 0 || rowCount === 0) {
    return -1;
  }
  let low = 0;
  let high = rowCount - 1;
  while (low <= high) {
    const mid = (low + high) >> 1;
    const top = getRowTop(mid);
    if (offsetTop < top) {
      high = mid - 1;
      continue;
    }
    const bottom = top + getRowHeight(mid);
    if (offsetTop >= bottom) {
      low = mid + 1;
      continue;
    }
    return mid;
  }
  return -1;
}

/**
 * Maps a point (relative to the top-left of the body cell client, where cells
 * are absolutely positioned) to a cell coordinate, or `undefined` when the
 * point falls outside the grid (e.g. on the ghost/empty area).
 */
export function getCellFromPoint<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  offsetLeft: number,
  offsetTop: number,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
): CellCoordinates | undefined {
  const rowCount = table.getRowModel().rows.length;
  const row = rowIndexAtOffset(offsetTop, rowCount, getRowTop, getRowHeight);
  if (row < 0) {
    return undefined;
  }

  let col = -1;
  const columns = table.getVisibleLeafColumns();
  for (let i = 0; i < columns.length; i++) {
    const start = columns[i].getStart();
    const end = start + columns[i].getSize();
    if (offsetLeft >= start && offsetLeft < end) {
      col = i;
      break;
    }
  }
  if (col < 0) {
    return undefined;
  }

  return { col, row };
}
