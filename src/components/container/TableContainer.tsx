import classNames from 'classnames';
import { TABLE_CONTAINER } from '../common/classes.ts';
import { TableQuadrant } from '../quadrant/TableQuadrant.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { TableLayout } from '../common/dimensions.ts';

export type TableContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> &
  TableLayout & {
    table: BP_TableInstance<TData>;
  };

export function TableContainer<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  className,
  ...restProps
}: TableContainerProps<TData>) {
  return (
    <div {...restProps} className={classNames(TABLE_CONTAINER, className)}>
      <TableQuadrant
        table={table}
        rowHeight={rowHeight}
        rowHeaderWidth={rowHeaderWidth}
        columnHeaderHeight={columnHeaderHeight}
      />
    </div>
  );
}
