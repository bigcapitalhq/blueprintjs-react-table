import type {
  BP_RowData,
  BP_RowSelectionState,
  BP_TableFeatures,
  BP_TableOptions,
  BP_VisibilityState,
  HTMLPropsRef,
} from '../types.ts';
import {
  hasLoadingOption,
  TableLoadingOption,
} from '../types.ts';
import { useCallback } from 'react';
import {
  functionalUpdate,
  type Updater,
} from '@tanstack/react-table';
import { useBPTableInstance } from '../hooks/use-bp-table-instance.ts';
import { useFreezePinning } from '../hooks/use-freeze-pinning.ts';
import { DEFAULT_OVERSCAN_ROW_COUNT } from '../hooks/use-row-virtualizer.ts';
import { useUncontrolled } from '../hooks/use-uncontrolled.ts';
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
  DEFAULT_ROW_SELECTION_COLUMN_WIDTH,
} from './common/dimensions.ts';
import type { BP_BodyContextMenuRenderer } from './common/menu-context.ts';
import { TableContainer } from './container/TableContainer.tsx';

export type BP_TableProps<TData extends BP_RowData> =
  BP_TableOptions<BP_TableFeatures, TData> & {
    htmlProps?: HTMLPropsRef<HTMLDivElement>;
    rowHeight?: number;
    rowHeaderWidth?: number;
    /**
     * If `false`, hides the row headers (the row-number column) and the corner
     * settings menu, mirroring Blueprint's `enableRowHeader`. The row-selection
     * checkboxes column (`showRowSelectionCheckboxes`) and frozen columns are
     * unaffected. Row resizing (`enableRowResizing`) is unavailable without row
     * headers, since its drag handle lives on the row header.
     *
     * @default true
     */
    enableRowHeader?: boolean;
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
     * An optional renderer for a custom context menu on the table body,
     * mirroring Blueprint's `bodyContextMenuRenderer`. Right-clicking a cell
     * opens the menu, and the renderer is supplied with a `BP_MenuContext`
     * describing the region(s) of interest: the current selection when the
     * click lands inside it, or the right-clicked cell otherwise. The context
     * also exposes the right-clicked TanStack row and cell.
     *
     * Right-clicking a cell outside the current selection moves the selection
     * (and the focused cell, when `enableFocusedCell` is enabled) to that cell
     * before the menu opens.
     */
    bodyContextMenuRenderer?: BP_BodyContextMenuRenderer<TData>;
    /**
     * Whether the body context menu is enabled.
     *
     * @default true if bodyContextMenuRenderer is defined
     */
    enableBodyContextMenu?: boolean;
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
    /**
     * If `true`, a row-selection checkboxes column is rendered right after the
     * row-number column: every row gets a checkbox, and the column's header is
     * a select-all checkbox (with an indeterminate state). The checkboxes are
     * wired to TanStack's row-selection state through the `rowSelection` /
     * `defaultRowSelection` props (or the standard `state.rowSelection` /
     * `initialState.rowSelection` options) and `onRowSelectionChange`, which
     * fires in both the controlled and uncontrolled modes. Shift-clicking a
     * checkbox selects the inclusive range of rows.
     *
     * This is independent of the region selection (`selectedRegions`):
     * checking a row does not select a region, and clicking a row header still
     * selects a full-row region. Rows checked here are highlighted and can be
     * read back with TanStack's `table.getSelectedRowModel()`.
     *
     * When the table is sorted or paginated, pair it with `getRowId` so
     * selection follows the data instead of the row position.
     *
     * @default false
     */
    showRowSelectionCheckboxes?: boolean;
    /**
     * Width of the row-selection checkboxes column, in pixels. Only used when
     * `showRowSelectionCheckboxes` is enabled.
     *
     * @default 30
     */
    rowSelectionColumnWidth?: number;
    /**
     * Controlled row selection, mapping row ids to booleans (`true` =
     * selected). When provided, selection is fully owned by the caller and
     * updated via `onRowSelectionChange`, which receives the next selection
     * value. Convenience alias for `state.rowSelection`; when both are
     * provided, this prop wins.
     */
    rowSelection?: BP_RowSelectionState;
    /**
     * Initial row selection for the uncontrolled mode, mapping row ids to
     * booleans (`true` = selected). Ignored when `rowSelection` (or
     * `state.rowSelection`) is provided; falls back to
     * `initialState.rowSelection`. Selection then lives inside the table and
     * `onRowSelectionChange` still fires on every change.
     */
    defaultRowSelection?: BP_RowSelectionState;
  };

export function BP_Table<TData extends BP_RowData>({
  htmlProps,
  rowHeight = DEFAULT_ROW_HEIGHT,
  showRowSelectionCheckboxes = false,
  rowSelectionColumnWidth = DEFAULT_ROW_SELECTION_COLUMN_WIDTH,
  rowHeaderWidth = DEFAULT_ROW_HEADER_WIDTH,
  enableRowHeader = true,
  columnHeaderHeight = DEFAULT_COLUMN_HEADER_HEIGHT,
  enableColumnReordering = false,
  enableSorting = false,
  loadingOptions = [],
  enableFocusedCell = false,
  enableGhostCells = false,
  bodyContextMenuRenderer,
  enableBodyContextMenu,
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
  rowSelection,
  defaultRowSelection,
  ...tableOptions
}: BP_TableProps<TData>) {
  const [resolvedRowSelection, setResolvedRowSelection] = useUncontrolled<BP_RowSelectionState>({
    value: rowSelection ?? tableOptions.state?.rowSelection,
    initialValue: defaultRowSelection ?? tableOptions.initialState?.rowSelection,
    finalValue: {},
    onChange: tableOptions.onRowSelectionChange,
  });

  // TanStack hands out state updaters; the uncontrolled hook consumes plain
  // values, so resolve the updater against the current selection first.
  const handleRowSelectionChange = useCallback(
    (updater: Updater<BP_RowSelectionState>) => {
      setResolvedRowSelection(functionalUpdate(updater, resolvedRowSelection));
    },
    [resolvedRowSelection, setResolvedRowSelection],
  );

  const table = useBPTableInstance<TData>({
    ...tableOptions,
    enableSorting,
    state: {
      ...tableOptions.state,
      ...(columnVisibility !== undefined ? { columnVisibility } : {}),
      rowSelection: resolvedRowSelection,
    },
    onRowSelectionChange: handleRowSelectionChange,
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
      enableRowHeader={enableRowHeader}
      columnHeaderHeight={columnHeaderHeight}
      enableColumnReordering={enableColumnReordering}
      enableSorting={enableSorting}
      areCellsLoading={areCellsLoading}
      areColumnHeadersLoading={areColumnHeadersLoading}
      areRowHeadersLoading={areRowHeadersLoading}
      enableFocusedCell={enableFocusedCell}
      enableGhostCells={enableGhostCells}
      bodyContextMenuRenderer={bodyContextMenuRenderer}
      enableBodyContextMenu={enableBodyContextMenu}
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
      selectionColumnWidth={showRowSelectionCheckboxes ? rowSelectionColumnWidth : 0}
      {...htmlProps}
    />
  );
}
