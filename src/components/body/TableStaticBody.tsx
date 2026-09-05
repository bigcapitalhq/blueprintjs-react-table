import classNames from 'classnames';
import {
  TABLE_BODY_CELLS,
  TABLE_BODY_VIRTUAL_CLIENT,
  TABLE_CELL_CLIENT,
  TABLE_QUADRANT_BODY_CONTAINER,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { ColumnRegion, RowRegion } from '../common/pinning.ts';
import { getFrozenColumnsWidth, getFrozenRowsHeight } from '../common/pinning.ts';
import { TableBodyCell } from './TableBodyCell.tsx';
import { TableRegionLayer } from '../layers/TableRegionLayer.tsx';
import { useTableSelection } from '../common/table-selection-context.ts';

export type TableStaticBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowRegion: RowRegion;
  columnRegion: ColumnRegion;
  rowHeight: number;
  areCellsLoading: boolean;
};

export function TableStaticBody<TData extends BP_RowData>({
  table,
  rowRegion,
  columnRegion,
  rowHeight,
  areCellsLoading,
  className,
  ...restProps
}: TableStaticBodyProps<TData>) {
  const selection = useTableSelection();
  const rows = rowRegion === 'top' ? table.getTopRows() : table.getCenterRows();
  const totalWidth =
    columnRegion === 'start' ? table.getStartTotalSize() : table.getCenterTotalSize();
  const totalHeight = rows.length * rowHeight;
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
              const cells =
                columnRegion === 'start' ? row.getStartVisibleCells() : row.getCenterVisibleCells();
              return cells.map((cell, columnIndex) => (
                <TableBodyCell
                  key={cell.id}
                  table={table}
                  cell={cell}
                  rowIndex={rowIndex}
                  rowTop={rowIndex * rowHeight}
                  columnRegion={columnRegion}
                  columnIndex={columnIndex}
                  rowHeight={rowHeight}
                  loading={areCellsLoading}
                  isLastInRow={columnIndex === cells.length - 1}
                  isLastInColumn={rowIndex === lastRowIndex}
                />
              ));
            })}
          </div>
          {selection != null && selection.regionGroups.length > 0 && (
            <TableRegionLayer
              table={table}
              regionGroups={selection.regionGroups}
              rowHeight={rowHeight}
              columnRegion={columnRegion}
              rowRegion={rowRegion}
              offsetLeft={columnRegion === 'start' ? 0 : getFrozenColumnsWidth(table)}
              offsetTop={rowRegion === 'top' ? 0 : getFrozenRowsHeight(table, rowHeight)}
            />
          )}
        </div>
      </div>
    </div>
  );
}