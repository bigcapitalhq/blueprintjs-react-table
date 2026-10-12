import { useLayoutEffect, useState } from 'react';
import type { MutableRefObject } from 'react';
import {
  DEFAULT_GHOST_COLUMN_WIDTH,
  MAX_GHOST_COLUMN_COUNT,
  MAX_GHOST_ROW_COUNT,
} from '../components/common/dimensions.ts';

/**
 * Describes the empty "ghost" cells rendered beyond the table's data rows and
 * columns when `enableGhostCells` is enabled and the content is smaller than
 * the viewport (mirroring Blueprint's `enableGhostCells` table prop).
 */
export type BP_GhostCells = {
  /** Number of empty columns rendered to the right of the data columns. */
  columnCount: number;
  /** Number of empty rows rendered below the data rows. */
  rowCount: number;
  /** Width of each ghost column, in pixels. */
  columnWidth: number;
  /** Height of each ghost row, in pixels. */
  rowHeight: number;
};

export type GhostCellsOptions = {
  /** Whether ghost cells are enabled on the table. */
  enableGhostCells: boolean;
  /** Default row height; ghost rows use this height. */
  rowHeight: number;
  /** Width of the row-header column, subtracted from the viewport width. */
  rowHeaderWidth: number;
  /** Height of the column-header rows, subtracted from the viewport height. */
  columnHeaderHeight: number;
  /** Total width of all visible columns combined. */
  totalWidth: number;
  /** Total height of all rows combined. */
  totalHeight: number;
  /** The table's scroll container, used to measure the visible viewport. */
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
};

/**
 * Measures the table's scroll container and computes the ghost cells needed to
 * fill leftover viewport space. Returns `undefined` when ghost cells are
 * disabled or when the content overflows (or exactly fits) both axes.
 */
export function useGhostCells({
  enableGhostCells,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  totalWidth,
  totalHeight,
  scrollContainerRef,
}: GhostCellsOptions): BP_GhostCells | undefined {
  const [viewport, setViewport] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const element = scrollContainerRef.current;
    if (element == null) {
      return;
    }
    const measure = () => {
      setViewport({ width: element.clientWidth, height: element.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [scrollContainerRef]);

  if (!enableGhostCells || viewport == null) {
    return undefined;
  }

  // The row headers and column headers live inside the same scroll container,
  // so they consume part of the visible viewport.
  const remainingWidth = viewport.width - rowHeaderWidth - totalWidth;
  const remainingHeight = viewport.height - columnHeaderHeight - totalHeight;

  const columnCount =
    remainingWidth > 0
      ? Math.min(Math.ceil(remainingWidth / DEFAULT_GHOST_COLUMN_WIDTH), MAX_GHOST_COLUMN_COUNT)
      : 0;
  const rowCount =
    remainingHeight > 0 ? Math.min(Math.ceil(remainingHeight / rowHeight), MAX_GHOST_ROW_COUNT) : 0;

  if (columnCount === 0 && rowCount === 0) {
    return undefined;
  }

  return {
    columnCount,
    rowCount,
    columnWidth: DEFAULT_GHOST_COLUMN_WIDTH,
    rowHeight,
  };
}

/**
 * Total width of the table's column area including ghost columns. Used to size
 * the column-header rows so ghost header cells fit next to the data columns.
 */
export function getGhostedTableWidth(totalWidth: number, ghosts?: BP_GhostCells) {
  return ghosts == null ? totalWidth : totalWidth + ghosts.columnCount * ghosts.columnWidth;
}
