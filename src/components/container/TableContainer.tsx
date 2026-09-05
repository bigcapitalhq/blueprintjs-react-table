import classNames from 'classnames';
import { useRef } from 'react';
import {
  TABLE_CONTAINER,
  TABLE_SELECTION_ENABLED,
} from '../common/classes.ts';
import {
  RegionCardinality,
  type FocusedCellCoordinates,
  type FocusedRegion,
  type Region,
} from '../common/region.ts';
import { useCellFocusSelection } from '../../hooks/use-cell-focus-selection.ts';
import type { RowVirtualizerOptions } from '../../hooks/use-row-virtualizer.ts';
import { TableQuadrantStack } from '../quadrant/TableQuadrantStack.tsx';
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
    focusedCell?: FocusedCellCoordinates;
    onFocusedCell?: (cell: FocusedCellCoordinates) => void;
    onFocusedRegion?: (region: FocusedRegion) => void;
    selectedRegions?: Region[];
    onSelection?: (regions: Region[]) => void;
    selectionModes?: RegionCardinality[];
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
  focusedCell,
  onFocusedCell,
  onFocusedRegion,
  selectedRegions,
  onSelection,
  selectionModes,
  enableRowVirtualization,
  overscanRowCount,
  className,
  ...restProps
}: TableContainerProps<TData>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const selection = useCellFocusSelection({
    table,
    rowHeight,
    scrollContainerRef,
    gridRef,
    rowHeaderWidth,
    columnHeaderHeight,
    enableFocusedCell,
    focusedCell,
    onFocusedCell,
    onFocusedRegion,
    selectedRegions,
    onSelection,
    selectionModes,
  });

  const selectionEnabledClass =
    selection.isSelectionModeEnabled(RegionCardinality.CELLS) ? TABLE_SELECTION_ENABLED : undefined;

  return (
    <div {...restProps} className={classNames(TABLE_CONTAINER, selectionEnabledClass, className)}>
      <TableQuadrantStack
        table={table}
        rowHeight={rowHeight}
        rowHeaderWidth={rowHeaderWidth}
        columnHeaderHeight={columnHeaderHeight}
        enableColumnReordering={enableColumnReordering}
        enableSorting={enableSorting}
        areCellsLoading={areCellsLoading}
        areColumnHeadersLoading={areColumnHeadersLoading}
        areRowHeadersLoading={areRowHeadersLoading}
        selection={selection}
        enableRowVirtualization={enableRowVirtualization}
        overscanRowCount={overscanRowCount}
        gridRef={gridRef}
        scrollContainerRef={scrollContainerRef}
      />
    </div>
  );
}
