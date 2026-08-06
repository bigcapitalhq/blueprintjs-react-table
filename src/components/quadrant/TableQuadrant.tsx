import classNames from 'classnames';
import {
  TABLE_QUADRANT,
  TABLE_QUADRANT_MAIN,
  TABLE_QUADRANT_SCROLL_CONTAINER,
} from '../common/classes.ts';
import { useColumnReorder } from '../../hooks/use-column-reorder.ts';
import { TableReorderGuides } from '../layers/TableReorderGuides.tsx';
import { TableResizeGuides } from '../layers/TableResizeGuides.tsx';
import { TableColumnReorderContext } from '../head/table-column-reorder-context.ts';
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
    enableColumnReordering?: boolean;
  };

export function TableQuadrant<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  enableColumnReordering = false,
  className,
  ...restProps
}: TableQuadrantProps<TData>) {
  const { contextValue, guideIndex, reorderingColumnId } = useColumnReorder(
    table,
    enableColumnReordering,
  );

  return (
    <div {...restProps} className={classNames(TABLE_QUADRANT, TABLE_QUADRANT_MAIN, className)}>
      <div className={TABLE_QUADRANT_SCROLL_CONTAINER}>
        <TableColumnReorderContext.Provider value={contextValue}>
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
          <TableReorderGuides
            table={table}
            reorderingColumnId={reorderingColumnId}
            guideIndex={guideIndex}
            rowHeaderWidth={rowHeaderWidth}
          />
        </TableColumnReorderContext.Provider>
      </div>
    </div>
  );
}
