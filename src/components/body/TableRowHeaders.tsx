import classNames from 'classnames';
import {
  TABLE_ROW_HEADERS,
  TABLE_ROW_HEADERS_CELLS_CONTAINER,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableRowHeaderCell } from './TableRowHeaderCell.tsx';

export type TableRowHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  rowHeaderWidth: number;
};

export function TableRowHeaders<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  className,
  ...restProps
}: TableRowHeadersProps<TData>) {
  const rows = table.getRowModel().rows;
  const totalHeight = rows.length * rowHeight;
  const lastRowIndex = rows.length - 1;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_ROW_HEADERS, className)}
      style={{ width: rowHeaderWidth }}
    >
      <div style={{ height: totalHeight }}>
        <div
          className={TABLE_ROW_HEADERS_CELLS_CONTAINER}
          style={{ height: totalHeight, transform: 'translateY(0px)' }}
        >
          {rows.map((row, rowIndex) => (
            <TableRowHeaderCell
              key={row.id}
              rowIndex={rowIndex}
              rowHeight={rowHeight}
              isLastInColumn={rowIndex === lastRowIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
