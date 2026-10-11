import classNames from 'classnames';
import {
  TABLE_BODY_CELLS,
  TABLE_BODY_VIRTUAL_CLIENT,
  TABLE_CELL_CLIENT,
  TABLE_QUADRANT_BODY_CONTAINER,
} from '../common/classes.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableBodyCell } from './TableBodyCell.tsx';
import { TableRegionLayer } from '../layers/TableRegionLayer.tsx';
import { useTableSelection } from '../common/table-selection-context.ts';

export type VirtualBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowHeight: number;
  areCellsLoading: boolean;
  rowVirtualizer: BP_RowVirtualizer;
};

export function VirtualBody<TData extends BP_RowData>({
  table,
  rowHeight,
  areCellsLoading,
  rowVirtualizer,
  className,
  ...restProps
}: VirtualBodyProps<TData>) {
  const selection = useTableSelection();
  const rows = table.getRowModel().rows;
  const totalWidth = table.getTotalSize();
  const totalHeight = rows.length * rowHeight;
  const lastRowIndex = rows.length - 1;

  const virtualRows = rowVirtualizer.getVirtualItems();
  const scrollMargin = rowVirtualizer.options.scrollMargin ?? 0;

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
            {virtualRows.map((virtualRow) => {
              const visibleCells = rows[virtualRow.index].getVisibleCells();
              return visibleCells.map((cell, columnIndex) => (
                <TableBodyCell
                  key={cell.id}
                  table={table}
                  cell={cell}
                  rowIndex={virtualRow.index}
                  rowTop={virtualRow.start - scrollMargin}
                  columnIndex={columnIndex}
                  rowHeight={rowHeight}
                  loading={areCellsLoading}
                  isLastInRow={columnIndex === visibleCells.length - 1}
                  isLastInColumn={virtualRow.index === lastRowIndex}
                />
              ));
            })}
          </div>
          {selection != null && selection.regionGroups.length > 0 && (
            <TableRegionLayer table={table} regionGroups={selection.regionGroups} rowHeight={rowHeight} />
          )}
        </div>
      </div>
    </div>
  );
}
