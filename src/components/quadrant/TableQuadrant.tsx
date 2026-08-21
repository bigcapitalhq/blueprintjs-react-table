import classNames from 'classnames';
import type { MutableRefObject } from 'react';
import {
  TABLE_QUADRANT,
  TABLE_QUADRANT_MAIN,
  TABLE_QUADRANT_SCROLL_CONTAINER,
} from '../common/classes.ts';
import { TableSelectionContext } from '../common/table-selection-context.ts';
import { useColumnReorder } from '../../hooks/use-column-reorder.ts';
import type { CellFocusSelectionApi } from '../../hooks/use-cell-focus-selection.ts';
import { TableReorderGuides } from '../layers/TableReorderGuides.tsx';
import { TableResizeGuides } from '../layers/TableResizeGuides.tsx';
import { TableColumnReorderContext } from '../head/table-column-reorder-context.ts';
import { TableTopContainer } from './TableTopContainer.tsx';
import { TableBottomContainer } from './TableBottomContainer.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
  TableLoading,
} from '../../types.ts';
import type { TableLayout } from '../common/dimensions.ts';

export type TableQuadrantProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> &
  TableLayout &
  TableLoading & {
    table: BP_TableInstance<TData>;
    enableColumnReordering?: boolean;
    selection: CellFocusSelectionApi;
    scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  };

export function TableQuadrant<TData extends BP_RowData>({
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  enableColumnReordering = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
  selection,
  scrollContainerRef,
  className,
  ...restProps
}: TableQuadrantProps<TData>) {
  const { contextValue, guideIndex, reorderingColumnId } = useColumnReorder(
    table,
    enableColumnReordering,
  );

  return (
    <div {...restProps} className={classNames(TABLE_QUADRANT, TABLE_QUADRANT_MAIN, className)}>
      <div
        ref={scrollContainerRef}
        className={TABLE_QUADRANT_SCROLL_CONTAINER}
        tabIndex={selection ? 0 : undefined}
        onKeyDown={selection?.handleKeyDown}
      >
        <TableColumnReorderContext.Provider value={contextValue}>
          <TableSelectionContext.Provider value={selection}>
            <TableTopContainer
              table={table}
              rowHeaderWidth={rowHeaderWidth}
              columnHeaderHeight={columnHeaderHeight}
              areColumnHeadersLoading={areColumnHeadersLoading}
            />
            <TableBottomContainer
              table={table}
              rowHeight={rowHeight}
              rowHeaderWidth={rowHeaderWidth}
              areCellsLoading={areCellsLoading}
              areRowHeadersLoading={areRowHeadersLoading}
            />
            <TableResizeGuides table={table} />
            <TableReorderGuides
              table={table}
              reorderingColumnId={reorderingColumnId}
              guideIndex={guideIndex}
              rowHeaderWidth={rowHeaderWidth}
            />
          </TableSelectionContext.Provider>
        </TableColumnReorderContext.Provider>
      </div>
    </div>
  );
}
