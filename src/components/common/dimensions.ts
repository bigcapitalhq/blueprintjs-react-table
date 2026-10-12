export const DEFAULT_ROW_HEIGHT = 20;
export const DEFAULT_ROW_HEADER_WIDTH = 30;
export const DEFAULT_COLUMN_HEADER_HEIGHT = 30;

/**
 * Width of the empty "ghost" columns rendered when `enableGhostCells` is on.
 * Mirrors Blueprint's `Grid.DEFAULT_GHOST_WIDTH` (which also matches TanStack's
 * default column size of 150).
 */
export const DEFAULT_GHOST_COLUMN_WIDTH = 150;

/**
 * Safety caps for the number of ghost columns/rows rendered to fill the
 * viewport. Mirrors Blueprint's `Grid.DEFAULT_MAX_COLUMNS` /
 * `Grid.DEFAULT_MAX_ROWS`, which bound the ghost-cell search the same way.
 */
export const MAX_GHOST_COLUMN_COUNT = 50;
export const MAX_GHOST_ROW_COUNT = 200;

export type TableLayout = {
  rowHeight: number;
  rowHeaderWidth: number;
  columnHeaderHeight: number;
};
