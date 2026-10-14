import classNames from 'classnames';
import { useRef } from 'react';
import {
  TABLE_CONTAINER,
  TABLE_NO_HORIZONTAL_SCROLL,
  TABLE_NO_VERTICAL_SCROLL,
  TABLE_SELECTION_ENABLED,
} from '../common/classes.ts';
import {
  RegionCardinality,
  type FocusedCellCoordinates,
  type FocusedRegion,
  type Region,
} from '../common/region.ts';
import { useCellFocusSelection } from '../../hooks/use-cell-focus-selection.ts';
import { useColumnHeaderHeight } from '../../hooks/use-column-header-height.ts';
import { useGhostCells } from '../../hooks/use-ghost-cells.ts';
import type { RowVirtualizerOptions } from '../../hooks/use-row-virtualizer.ts';
import { useRowResizing, type RowResizingApi } from '../../hooks/use-row-resizing.ts';
import { TableQuadrantStack } from '../quadrant/TableQuadrantStack.tsx';
import type { BP_BodyContextMenuRenderer } from '../common/menu-context.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
  TableLoading,
} from '../../types.ts';
import type { TableLayout } from '../common/dimensions.ts';

export type TableContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> &
  TableLayout &
  TableLoading &
  Pick<
    RowVirtualizerOptions<TData>,
    'enableRowVirtualization' | 'overscanRowCount'
  > & {
    table: BP_TableInstance<TData>;
    enableColumnReordering?: boolean;
    enableSorting?: boolean;
    enableFocusedCell?: boolean;
    enableGhostCells?: boolean;
    bodyContextMenuRenderer?: BP_BodyContextMenuRenderer<TData>;
    enableBodyContextMenu?: boolean;
    focusedCell?: FocusedCellCoordinates;
    onFocusedCell?: (cell: FocusedCellCoordinates) => void;
    onFocusedRegion?: (region: FocusedRegion) => void;
    selectedRegions?: Region[];
    onSelection?: (regions: Region[]) => void;
    selectionModes?: RegionCardinality[];
    enableRowResizing?: boolean;
    rowHeights?: Array<number | undefined>;
    defaultRowHeights?: Array<number | undefined>;
    onRowHeightChanged?: (index: number, height: number) => void;
    minRowHeight?: number;
    maxRowHeight?: number;
    /** Width of the row-selection checkboxes column; `0` hides the column. */
    selectionColumnWidth?: number;
  };

export function TableContainer<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  enableColumnReordering = false,
  enableSorting = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
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
  enableRowVirtualization,
  overscanRowCount,
  enableRowResizing = false,
  rowHeights,
  defaultRowHeights,
  onRowHeightChanged,
  minRowHeight,
  maxRowHeight,
  selectionColumnWidth = 0,
  className,
  ...restProps
}: TableContainerProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // The row numbers and the row-selection checkboxes column form the frozen
  // chrome to the left of the table's columns; the coordinate math (focus,
  // selection, ghost cells) treats them as one row-header area.
  const effectiveRowHeaderWidth = rowHeaderWidth + selectionColumnWidth;

  // Column headers may render multiple rows (grouped columns) or grow with
  // custom content, so the effective height is measured and shared by the
  // quadrant layout, focus/selection, and ghost cells.
  const { ref: columnHeaderMeasureRef, height: resolvedColumnHeaderHeight } = useColumnHeaderHeight({
    minHeight: columnHeaderHeight,
    headerRowCount: table.getHeaderGroups().length,
  });

  const rowResizing: RowResizingApi = useRowResizing({
    rowHeight,
    rowCount: table.getRowModel().rows.length,
    rowHeights,
    defaultRowHeights,
    enableRowResizing,
    minRowHeight,
    maxRowHeight,
    onRowHeightChanged,
  });

  const selection = useCellFocusSelection({
    table,
    getRowTop: rowResizing.getRowTop,
    getRowHeight: rowResizing.getRowHeight,
    scrollContainerRef,
    rowHeaderWidth: effectiveRowHeaderWidth,
    columnHeaderHeight: resolvedColumnHeaderHeight,
    bodyContextMenuRenderer,
    enableBodyContextMenu,
    enableFocusedCell,
    focusedCell,
    onFocusedCell,
    onFocusedRegion,
    selectedRegions,
    onSelection,
    selectionModes,
  });

  const ghosts = useGhostCells({
    enableGhostCells,
    rowHeight,
    rowHeaderWidth: effectiveRowHeaderWidth,
    columnHeaderHeight: resolvedColumnHeaderHeight,
    totalWidth: table.getTotalSize(),
    totalHeight: rowResizing.totalHeight,
    scrollContainerRef,
  });

  const selectionEnabledClass =
    selection.isSelectionModeEnabled(RegionCardinality.CELLS) ? TABLE_SELECTION_ENABLED : undefined;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_CONTAINER, selectionEnabledClass, {
        [TABLE_NO_HORIZONTAL_SCROLL]: ghosts != null && ghosts.columnCount > 0,
        [TABLE_NO_VERTICAL_SCROLL]: ghosts != null && ghosts.rowCount > 0,
      }, className)}
    >
      <TableQuadrantStack
        table={table}
        rowHeaderWidth={rowHeaderWidth}
        columnHeaderHeight={resolvedColumnHeaderHeight}
        columnHeaderMeasureRef={columnHeaderMeasureRef}
        enableColumnReordering={enableColumnReordering}
        enableSorting={enableSorting}
        areCellsLoading={areCellsLoading}
        areColumnHeadersLoading={areColumnHeadersLoading}
        areRowHeadersLoading={areRowHeadersLoading}
        selection={selection}
        rowResizing={rowResizing}
        ghosts={ghosts}
        enableRowVirtualization={enableRowVirtualization}
        overscanRowCount={overscanRowCount}
        scrollContainerRef={scrollContainerRef}
        selectionColumnWidth={selectionColumnWidth}
      />
    </div>
  );
}
