import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import type { CellCoordinates } from './region.ts';

/**
 * Maps a point (relative to the top-left of the body cell client, where cells
 * are absolutely positioned) to a cell coordinate, or `undefined` when the
 * point falls outside the grid (e.g. on the ghost/empty area).
 */
export function getCellFromPoint<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  offsetLeft: number,
  offsetTop: number,
  rowHeight: number,
): CellCoordinates | undefined {
  const rowCount = table.getRowModel().rows.length;
  const row = Math.floor(offsetTop / rowHeight);
  if (row < 0 || row >= rowCount) {
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
