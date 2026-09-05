import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { ColumnRegion, RowRegion } from '../common/pinning.ts';
import { VirtualBody } from './VirtualBody.tsx';
import { TableStaticBody } from './TableStaticBody.tsx';

export type TableBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowRegion: RowRegion;
  columnRegion: ColumnRegion;
  rowHeight: number;
  areCellsLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
};

export function TableBody<TData extends BP_RowData>({
  table,
  rowRegion,
  columnRegion,
  rowHeight,
  areCellsLoading,
  rowVirtualizer,
  className,
  ...restProps
}: TableBodyProps<TData>) {
  if (rowRegion === 'center' && rowVirtualizer != null) {
    return (
      <VirtualBody
        table={table}
        columnRegion={columnRegion}
        rowHeight={rowHeight}
        areCellsLoading={areCellsLoading}
        rowVirtualizer={rowVirtualizer}
        className={className}
        {...restProps}
      />
    );
  }

  return (
    <TableStaticBody
      table={table}
      rowRegion={rowRegion}
      columnRegion={columnRegion}
      rowHeight={rowHeight}
      areCellsLoading={areCellsLoading}
      className={className}
      {...restProps}
    />
  );
}