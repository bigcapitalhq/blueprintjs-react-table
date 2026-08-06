import classNames from 'classnames';
import { TABLE_TOP_CONTAINER } from '../common/classes.ts';
import { TableMenu } from '../head/TableMenu.tsx';
import { TableColumnHeaders } from '../head/TableColumnHeaders.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';

export type TableTopContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
  columnHeaderHeight: number;
};

export function TableTopContainer<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
  columnHeaderHeight,
  className,
  ...restProps
}: TableTopContainerProps<TData>) {
  return (
    <div {...restProps} className={classNames(TABLE_TOP_CONTAINER, className)}>
      <TableMenu width={rowHeaderWidth} height={columnHeaderHeight} />
      <TableColumnHeaders table={table} />
    </div>
  );
}
