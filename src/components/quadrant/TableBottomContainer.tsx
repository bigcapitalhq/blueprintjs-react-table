import classNames from 'classnames';
import { TABLE_BOTTOM_CONTAINER } from '../common/classes.ts';
import { TableRowHeaders } from '../body/TableRowHeaders.tsx';
import { TableBody } from '../body/TableBody.tsx';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';

export type TableBottomContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
  areCellsLoading: boolean;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
};

export function TableBottomContainer<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
  areCellsLoading,
  areRowHeadersLoading,
  rowVirtualizer,
  rowResizing,
  className,
  ...restProps
}: TableBottomContainerProps<TData>) {
  return (
    <div
      {...restProps}
      className={classNames(TABLE_BOTTOM_CONTAINER, className)}
      style={{ height: rowResizing.totalHeight }}
    >
      <TableRowHeaders
        table={table}
        rowHeaderWidth={rowHeaderWidth}
        areRowHeadersLoading={areRowHeadersLoading}
        rowVirtualizer={rowVirtualizer}
        rowResizing={rowResizing}
      />
      <TableBody
        table={table}
        areCellsLoading={areCellsLoading}
        rowVirtualizer={rowVirtualizer}
        rowResizing={rowResizing}
      />
    </div>
  );
}
