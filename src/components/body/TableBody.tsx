import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { VirtualBody } from './VirtualBody.tsx';
import { TableStaticBody } from './TableStaticBody.tsx';

export type TableBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  areCellsLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
};

export function TableBody<TData extends BP_RowData>({
  table,
  areCellsLoading,
  rowVirtualizer,
  rowResizing,
  className,
  ...restProps
}: TableBodyProps<TData>) {
  if (rowVirtualizer != null) {
    return (
      <VirtualBody
        table={table}
        areCellsLoading={areCellsLoading}
        rowVirtualizer={rowVirtualizer}
        rowResizing={rowResizing}
        className={className}
        {...restProps}
      />
    );
  }

  return (
    <TableStaticBody
      table={table}
      areCellsLoading={areCellsLoading}
      rowResizing={rowResizing}
      className={className}
      {...restProps}
    />
  );
}
