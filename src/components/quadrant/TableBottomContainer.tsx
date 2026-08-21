import classNames from 'classnames';
import { TABLE_BOTTOM_CONTAINER } from '../common/classes.ts';
import { TableRowHeaders } from '../body/TableRowHeaders.tsx';
import { TableBody } from '../body/TableBody.tsx';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';

export type TableBottomContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  rowHeaderWidth: number;
  areCellsLoading: boolean;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
};

export function TableBottomContainer<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  areCellsLoading,
  areRowHeadersLoading,
  rowVirtualizer,
  className,
  ...restProps
}: TableBottomContainerProps<TData>) {
  const totalHeight = table.getRowModel().rows.length * rowHeight;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_BOTTOM_CONTAINER, className)}
      style={{ height: totalHeight }}
    >
      <TableRowHeaders
        table={table}
        rowHeight={rowHeight}
        rowHeaderWidth={rowHeaderWidth}
        areRowHeadersLoading={areRowHeadersLoading}
        rowVirtualizer={rowVirtualizer}
      />
      <TableBody
        table={table}
        rowHeight={rowHeight}
        areCellsLoading={areCellsLoading}
        rowVirtualizer={rowVirtualizer}
      />
    </div>
  );
}
