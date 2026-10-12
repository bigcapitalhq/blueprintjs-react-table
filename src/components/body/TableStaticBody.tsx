import classNames from 'classnames';
import {
  TABLE_BODY_CELLS,
  TABLE_BODY_VIRTUAL_CLIENT,
  TABLE_CELL_CLIENT,
  TABLE_QUADRANT_BODY_CONTAINER,
} from '../common/classes.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableBodyCell } from './TableBodyCell.tsx';
import { TableRegionLayer } from '../layers/TableRegionLayer.tsx';
import { useTableSelection } from '../common/table-selection-context.ts';

export type TableStaticBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  areCellsLoading: boolean;
  rowResizing: RowResizingApi;
};

export function TableStaticBody<TData extends BP_RowData>({
  table,
  areCellsLoading,
  rowResizing,
  className,
  ...restProps
}: TableStaticBodyProps<TData>) {
  const selection = useTableSelection();
  const rows = table.getRowModel().rows;
  const totalWidth = table.getTotalSize();
  const totalHeight = rowResizing.totalHeight;
  const lastRowIndex = rows.length - 1;

  return (
    <div {...restProps} className={classNames(TABLE_QUADRANT_BODY_CONTAINER, className)}>
      <div>
        <div
          className={classNames(TABLE_BODY_VIRTUAL_CLIENT, TABLE_CELL_CLIENT)}
          style={{ height: totalHeight, width: totalWidth }}
          onPointerDown={selection?.handleBodyPointerDown}
          onPointerMove={selection?.handleBodyPointerMove}
          onPointerUp={selection?.handleBodyPointerUp}
          onPointerCancel={selection?.handleBodyPointerCancel}
        >
          <div className={TABLE_BODY_CELLS}>
            {rows.map((row, rowIndex) => {
              const visibleCells = row.getVisibleCells();
              return visibleCells.map((cell, columnIndex) => (
                <TableBodyCell
                  key={cell.id}
                  table={table}
                  cell={cell}
                  rowIndex={rowIndex}
                  rowTop={rowResizing.getRowTop(rowIndex)}
                  columnIndex={columnIndex}
                  rowHeight={rowResizing.getRowHeight(rowIndex)}
                  loading={areCellsLoading}
                  isLastInRow={columnIndex === visibleCells.length - 1}
                  isLastInColumn={rowIndex === lastRowIndex}
                />
              ));
            })}
          </div>
          {selection != null && selection.regionGroups.length > 0 && (
            <TableRegionLayer
              table={table}
              regionGroups={selection.regionGroups}
              getRowTop={rowResizing.getRowTop}
              getRowHeight={rowResizing.getRowHeight}
              totalHeight={rowResizing.totalHeight}
            />
          )}
        </div>
      </div>
    </div>
  );
}
