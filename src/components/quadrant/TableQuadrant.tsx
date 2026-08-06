import classNames from 'classnames';
import {
  TABLE_QUADRANT,
  TABLE_QUADRANT_MAIN,
  TABLE_QUADRANT_SCROLL_CONTAINER,
} from '../common/classes.ts';
import { TableResizeGuides } from '../layers/TableResizeGuides.tsx';
import { TableTopContainer } from './TableTopContainer.tsx';
import { TableBottomContainer } from './TableBottomContainer.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { TableLayout } from '../common/dimensions.ts';

export type TableQuadrantProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> &
  TableLayout & {
    table: BP_TableInstance<TData>;
  };

export function TableQuadrant<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  className,
  ...restProps
}: TableQuadrantProps<TData>) {
  return (
    <div {...restProps} className={classNames(TABLE_QUADRANT, TABLE_QUADRANT_MAIN, className)}>
      <div className={TABLE_QUADRANT_SCROLL_CONTAINER}>
        <TableTopContainer
          table={table}
          rowHeaderWidth={rowHeaderWidth}
          columnHeaderHeight={columnHeaderHeight}
        />
        <TableBottomContainer
          table={table}
          rowHeight={rowHeight}
          rowHeaderWidth={rowHeaderWidth}
        />
        <TableResizeGuides table={table} />
      </div>
    </div>
  );
}
