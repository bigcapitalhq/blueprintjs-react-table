import type { MutableRefObject } from 'react';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import {
  getColumnIndexAtRegionOffset,
  getFrozenColumnsWidth,
  getFrozenRowsHeight,
  getRowIndexAtRegionOffset,
} from './pinning.ts';
import type { CellCoordinates } from './region.ts';

export type CellLookupOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  /** The main (interactive) quadrant's scroll container. */
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  /** Width of the frozen row-header column. */
  rowHeaderWidth: number;
  /** Effective height of the column-header area. */
  columnHeaderHeight: number;
  /** Resolved absolute top offset of the row at the given index. */
  getRowTop: (index: number) => number;
  /** Resolved height of the row at the given index. */
  getRowHeight: (index: number) => number;
};

/**
 * Maps a client point (e.g. a pointer event's viewport coordinates) to a cell
 * coordinate, or `undefined` when the point falls outside the grid.
 *
 * The main scroll container spans the whole table, so the point can be mapped
 * to viewport-relative offsets within the columns area (right of the
 * row-header column) and the rows area (below the column headers). The frozen
 * columns/rows are pinned to the leading edge of those areas and never scroll;
 * the scrollable region starts after them and is shifted by the container's
 * scroll offset. This works from any quadrant, which makes selection drags
 * that cross the frozen/scrollable boundary behave correctly.
 */
export function getCellFromClientPoint<TData extends BP_RowData>(
  {
    table,
    scrollContainerRef,
    rowHeaderWidth,
    columnHeaderHeight,
    getRowTop,
    getRowHeight,
  }: CellLookupOptions<TData>,
  clientX: number,
  clientY: number,
): CellCoordinates | undefined {
  const element = scrollContainerRef.current;
  if (element == null) {
    return undefined;
  }
  const rect = element.getBoundingClientRect();
  // Pointer position within the table's viewport, relative to the rows area
  // (right of the row-header column) and the columns area (below the column
  // headers).
  const viewportX = clientX - rect.left;
  const viewportY = clientY - rect.top;

  const frozenColumnsWidth = getFrozenColumnsWidth(table);
  const frozenRowsHeight = getFrozenRowsHeight(table, getRowHeight);

  // The frozen columns/rows are pinned to the leading edge of the viewport and
  // never scroll; the scrollable region starts after them and is shifted by
  // the scroll offset.
  const frozenColumnX = viewportX - rowHeaderWidth;
  const centerColumnX = frozenColumnX - frozenColumnsWidth + element.scrollLeft;
  const frozenRowY = viewportY - columnHeaderHeight;
  const centerRowY = frozenRowY - frozenRowsHeight + element.scrollTop;

  const col =
    frozenColumnX >= 0 && frozenColumnX < frozenColumnsWidth
      ? getColumnIndexAtRegionOffset(table, 'start', frozenColumnX)
      : getColumnIndexAtRegionOffset(table, 'center', centerColumnX);
  const row =
    frozenRowY >= 0 && frozenRowY < frozenRowsHeight
      ? getRowIndexAtRegionOffset(table, 'top', frozenRowY, getRowTop, getRowHeight)
      : getRowIndexAtRegionOffset(table, 'center', centerRowY, getRowTop, getRowHeight);

  if (col == null || row == null) {
    return undefined;
  }
  return { col, row };
}
