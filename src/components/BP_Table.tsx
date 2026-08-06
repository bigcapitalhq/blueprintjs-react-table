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
  };

export function BP_Table<TData extends BP_RowData>({
  htmlProps,
  rowHeight = DEFAULT_ROW_HEIGHT,
  rowHeaderWidth = DEFAULT_ROW_HEADER_WIDTH,
  columnHeaderHeight = DEFAULT_COLUMN_HEADER_HEIGHT,
  enableColumnReordering = false,
  loadingOptions = [],
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
      {...htmlProps}
    />
  );
}
