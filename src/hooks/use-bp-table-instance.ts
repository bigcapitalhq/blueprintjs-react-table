import {
  columnOrderingFeature,
  columnResizingFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
  BP_TableOptions,
} from '../types.ts';

export const useBPTableInstance = <TData extends BP_RowData>(
  definedTableOptions: BP_TableOptions<BP_TableFeatures, TData>,
): BP_TableInstance<TData> => {
  const table = useTable({
    ...definedTableOptions,
    initialState: definedTableOptions.initialState ?? {},
    features: definedTableOptions.features ?? tableFeatures({ columnSizingFeature, columnResizingFeature, columnOrderingFeature, columnVisibilityFeature }),
    columnResizeMode: definedTableOptions.columnResizeMode ?? 'onEnd',
  });

  return table as BP_TableInstance<TData>;
};
