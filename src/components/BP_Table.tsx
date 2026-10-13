import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableOptions,
  BP_VisibilityState,
  HTMLPropsRef,
} from '../types.ts';
import {
  hasLoadingOption,
  TableLoadingOption,
} from '../types.ts';
import { useBPTableInstance } from '../hooks/use-bp-table-instance.ts';
import { useFreezePinning } from '../hooks/use-freeze-pinning.ts';
import { DEFAULT_OVERSCAN_ROW_COUNT } from '../hooks/use-row-virtualizer.ts';
import type {
  FocusedCellCoordinates,
  FocusedRegion,
  Region,
  RegionCardinality,
} from './common/region.ts';
import {
  DEFAULT_COLUMN_HEADER_HEIGHT,
  DEFAULT_ROW_HEADER_WIDTH,
  DEFAULT_ROW_HEIGHT,
} from './common/dimensions.ts';
import { TableContainer } from './container/TableContainer.tsx';

export type BP_TableProps<TData extends BP_RowData> =
  BP_TableOptions<BP_TableFeatures, TData> & {
    htmlProps?: HTMLPropsRef<HTMLDivElement>;
    rowHeight?: number;
    rowHeaderWidth?: number;
    columnHeaderHeight?: number;
    enableColumnReordering?: boolean;
    loadingOptions?: TableLoadingOption[];
    /**
     * If `true`, a chevron menu appears on each sortable column header (on
     * hover) with "Sort Asc" / "Sort Desc" actions, mirroring Blueprint's
     * sortable table. The value is also forwarded to TanStack's
     * `enableSorting` table option. Disable sorting for a specific column with
     * `enableSorting: false` on its column definition.
     *
     * @default false
     */
    enableSorting?: boolean;

    /**
     * If `true`, a focusable "focused cell" is enabled: clicking a cell moves the
     * focus there and arrow keys navigate between cells (with a blue focus border
     * overlay), mirroring Blueprint's `enableFocusedCell`.
     *
     * @default false
     */
    enableFocusedCell?: boolean;
    /**
     * If `true`, empty space in the table container will be filled with empty
     * cells instead of a blank background. Ghost cells render in the body, the
     * column headers, and the row headers whenever the content is smaller than
     * the viewport, and scrolling is disabled on the axes they fill, mirroring
     * Blueprint's `enableGhostCells`.
     *
     * @default false
     */
    enableGhostCells?: boolean;
    /**
     * A controlled focused cell. When provided, focus state is fully owned by the
     * caller and updated via `onFocusedCell`.
     */
    focusedCell?: FocusedCellCoordinates;
    /** Callback invoked when the focused cell changes (controlled or uncontrolled). */
    onFocusedCell?: (cell: FocusedCellCoordinates) => void;
    /** Callback invoked when the focused region changes. */
    onFocusedRegion?: (region: FocusedRegion) => void;
    /**
     * Controlled selected regions. When provided, selection state is fully owned
     * by the caller and updated via `onSelection`.
     */
    selectedRegions?: Region[];
    /** Callback invoked when the selected regions change. */
    onSelection?: (regions: Region[]) => void;
    /**
     * Which region cardinalities are selectable. Defaults to all of them.
     */
    selectionModes?: RegionCardinality[];
    /**
     * If `true`, only the rows currently visible in the scroll container (plus
     * an overscan buffer) are rendered, allowing the table to scale to very
     * large data sets.
     *
     * @default false
     */
    enableRowVirtualization?: boolean;
    /**
     * Number of leftmost columns that are frozen (pinned in place) while all
     * other columns remain scrollable, mirroring Blueprint's
     * `numFrozenColumns`. The frozen columns are derived from the current
     * column order and column visibility, so reordering and hiding columns
     * keeps freezing correct. Column headers and row headers are always frozen.
     *
     * @default 0
     */
    numFrozenColumns?: number;
    /**
     * Number of topmost rows that are frozen (pinned in place) while all other
     * rows remain scrollable, mirroring Blueprint's `numFrozenRows`. The frozen
     * rows are derived from the current row model, so freezing follows sorting.
     *
     * @default 0
     */
    numFrozenRows?: number;
    /**
     * Number of rows rendered above and below the visible viewport when
     * `enableRowVirtualization` is enabled.
     *
     * @default 5
     */
    overscanRowCount?: number;
    /**
     * Controlled column visibility, mapping column ids to booleans (`true` =
     * visible, `false` = hidden). Convenience alias for
     * `state.columnVisibility`; when both are provided, this prop wins.
     */
    columnVisibility?: BP_VisibilityState;
    /**
     * If `true`, rows can be resized by dragging the horizontal handle at the
     * bottom of each row header.
     *
     * @default false
     */
    enableRowResizing?: boolean;
    /**
     * Controlled per-row heights, indexed by row index. When provided, row
     * heights are fully owned by the caller and updated via
     * `onRowHeightChanged`. Entries of `undefined` fall back to `rowHeight`.
     */
    rowHeights?: Array<number | undefined>;
    /** Initial per-row heights for the uncontrolled mode. */
    defaultRowHeights?: Array<number | undefined>;
    /**
     * Listener invoked whenever a row's height changes. Fires continuously
     * during a resize drag (and once more when it ends), in both the
     * controlled and uncontrolled modes.
     */
    onRowHeightChanged?: (index: number, height: number) => void;
    /** Minimum height a row can be resized to. @default 6 */
    minRowHeight?: number;
    /** Maximum height a row can be resized to. @default 100 */
    maxRowHeight?: number;
  };

export function BP_Table<TData extends BP_RowData>({
  htmlProps,
  rowHeight = DEFAULT_ROW_HEIGHT,
  rowHeaderWidth = DEFAULT_ROW_HEADER_WIDTH,
  columnHeaderHeight = DEFAULT_COLUMN_HEADER_HEIGHT,
  enableColumnReordering = false,
  enableSorting = false,
  loadingOptions = [],
  enableFocusedCell = false,
  enableGhostCells = false,
  focusedCell,
  onFocusedCell,
  onFocusedRegion,
  selectedRegions,
  onSelection,
  selectionModes,
  enableRowVirtualization = false,
  numFrozenColumns = 0,
  numFrozenRows = 0,
  overscanRowCount = DEFAULT_OVERSCAN_ROW_COUNT,
  columnVisibility,
  enableRowResizing = false,
  rowHeights,
  defaultRowHeights,
  onRowHeightChanged,
  minRowHeight,
  maxRowHeight,
  ...tableOptions
}: BP_TableProps<TData>) {
  const table = useBPTableInstance<TData>({
    ...tableOptions,
    enableSorting,
    state: {
      ...tableOptions.state,
      ...(columnVisibility !== undefined ? { columnVisibility } : {}),
    },
  });

  useFreezePinning({ table, numFrozenColumns, numFrozenRows });

  const areCellsLoading = hasLoadingOption(loadingOptions, TableLoadingOption.CELLS);
  const areColumnHeadersLoading = hasLoadingOption(
    loadingOptions,
    TableLoadingOption.COLUMN_HEADERS,
  );
  const areRowHeadersLoading = hasLoadingOption(loadingOptions, TableLoadingOption.ROW_HEADERS);

  return (
    <TableContainer
      table={table}
      rowHeight={rowHeight}
      rowHeaderWidth={rowHeaderWidth}
      columnHeaderHeight={columnHeaderHeight}
      enableColumnReordering={enableColumnReordering}
      enableSorting={enableSorting}
      areCellsLoading={areCellsLoading}
      areColumnHeadersLoading={areColumnHeadersLoading}
      areRowHeadersLoading={areRowHeadersLoading}
      enableFocusedCell={enableFocusedCell}
      enableGhostCells={enableGhostCells}
      focusedCell={focusedCell}
      onFocusedCell={onFocusedCell}
      onFocusedRegion={onFocusedRegion}
      selectedRegions={selectedRegions}
      onSelection={onSelection}
      selectionModes={selectionModes}
      enableRowVirtualization={enableRowVirtualization}
      overscanRowCount={overscanRowCount}
      enableRowResizing={enableRowResizing}
      rowHeights={rowHeights}
      defaultRowHeights={defaultRowHeights}
      onRowHeightChanged={onRowHeightChanged}
      minRowHeight={minRowHeight}
      maxRowHeight={maxRowHeight}
      {...htmlProps}
    />
  );
}
