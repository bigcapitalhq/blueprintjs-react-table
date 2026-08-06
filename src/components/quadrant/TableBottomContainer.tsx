import classNames from 'classnames';
import { TABLE_BOTTOM_CONTAINER } from '../common/classes.ts';
import { TableRowHeaders } from '../body/TableRowHeaders.tsx';
import { TableBody } from '../body/TableBody.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';

export type TableBottomContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  rowHeaderWidth: number;
};

export function TableBottomContainer<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
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
      <TableRowHeaders table={table} rowHeight={rowHeight} rowHeaderWidth={rowHeaderWidth} />
      <TableBody table={table} rowHeight={rowHeight} />
    </div>
  );
}
