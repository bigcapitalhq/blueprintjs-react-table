import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableOptions,
  HTMLPropsRef,
} from '../types.ts';
import {
  hasLoadingOption,
  TableLoadingOption,
} from '../types.ts';
import { useBPTableInstance } from '../hooks/use-bp-table-instance.ts';
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
     * If `true`, a focusable "focused cell" is enabled: clicking a cell moves the
     * focus there and arrow keys navigate between cells (with a blue focus border
     * overlay), mirroring Blueprint's `enableFocusedCell`.
     *
     * @default false
     */
    enableFocusedCell?: boolean;
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
  };

export function BP_Table<TData extends BP_RowData>({
  htmlProps,
  rowHeight = DEFAULT_ROW_HEIGHT,
  rowHeaderWidth = DEFAULT_ROW_HEADER_WIDTH,
  columnHeaderHeight = DEFAULT_COLUMN_HEADER_HEIGHT,
  enableColumnReordering = false,
  loadingOptions = [],
  enableFocusedCell = false,
  focusedCell,
  onFocusedCell,
  onFocusedRegion,
  selectedRegions,
  onSelection,
  selectionModes,
  ...tableOptions
}: BP_TableProps<TData>) {
  const table = useBPTableInstance<TData>(tableOptions);

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
      areCellsLoading={areCellsLoading}
      areColumnHeadersLoading={areColumnHeadersLoading}
      areRowHeadersLoading={areRowHeadersLoading}
      enableFocusedCell={enableFocusedCell}
      focusedCell={focusedCell}
      onFocusedCell={onFocusedCell}
      onFocusedRegion={onFocusedRegion}
      selectedRegions={selectedRegions}
      onSelection={onSelection}
      selectionModes={selectionModes}
      {...htmlProps}
    />
  );
}
