import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { VirtualBody } from './VirtualBody.tsx';
import { TableStaticBody } from './TableStaticBody.tsx';

export type TableBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  areCellsLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
};

export function TableBody<TData extends BP_RowData>({
  table,
  rowHeight,
  areCellsLoading,
  rowVirtualizer,
  className,
  ...restProps
}: TableBodyProps<TData>) {
  if (rowVirtualizer != null) {
    return <VirtualBody table={table} rowHeight={rowHeight} areCellsLoading={areCellsLoading} rowVirtualizer={rowVirtualizer} className={className} {...restProps} />;
  }

  return <TableStaticBody table={table} rowHeight={rowHeight} areCellsLoading={areCellsLoading} className={className} {...restProps} />;
}
