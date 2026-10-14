import {
  columnOrderingFeature,
  columnPinningFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  rowPinningFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
  BP_TableOptions,
} from '../types.ts';

/**
 * The feature registry `BP_Table` uses by default: column sizing/resizing,
 * ordering, visibility, pinning, row pinning, and sorting. It is exported so
 * layers built on top of `BP_Table` (such as the `withPagination` HOC) can
 * compose additional features without having to replace the defaults.
 *
 * Compose it with `tableFeatures()`:
 *
 *   tableFeatures({ ...DEFAULT_BP_TABLE_FEATURES, rowPaginationFeature, paginatedRowModel: createPaginatedRowModel() })
 */
export const DEFAULT_BP_TABLE_FEATURES = tableFeatures({
  columnSizingFeature,
  columnResizingFeature,
  columnOrderingFeature,
  columnVisibilityFeature,
  columnPinningFeature,
  rowPinningFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
});

export const useBPTableInstance = <TData extends BP_RowData>(
  definedTableOptions: BP_TableOptions<BP_TableFeatures, TData>,
): BP_TableInstance<TData> => {
  const table = useTable({
    ...definedTableOptions,
    initialState: definedTableOptions.initialState ?? {},
    features: definedTableOptions.features ?? DEFAULT_BP_TABLE_FEATURES,
    columnResizeMode: definedTableOptions.columnResizeMode ?? 'onEnd',
  });

  return table as BP_TableInstance<TData>;
};
