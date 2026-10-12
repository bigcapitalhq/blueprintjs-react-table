import classNames from 'classnames';
import {
  TABLE_BODY_CELLS,
  TABLE_BODY_VIRTUAL_CLIENT,
  TABLE_CELL_CLIENT,
  TABLE_QUADRANT_BODY_CONTAINER,
} from '../common/classes.ts';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableBodyCell } from './TableBodyCell.tsx';
import { TableGhostCells } from './TableGhostCells.tsx';
import { TableRegionLayer } from '../layers/TableRegionLayer.tsx';
import { useTableSelection } from '../common/table-selection-context.ts';

export type VirtualBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  areCellsLoading: boolean;
  rowVirtualizer: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
  ghosts?: BP_GhostCells;
};

export function VirtualBody<TData extends BP_RowData>({
  table,
  areCellsLoading,
  rowVirtualizer,
  rowResizing,
  ghosts,
  className,
  ...restProps
}: VirtualBodyProps<TData>) {
  const selection = useTableSelection();
  const rows = table.getRowModel().rows;
  const totalWidth = table.getTotalSize();
  const totalHeight = rowResizing.totalHeight;
  const lastRowIndex = rows.length - 1;

  const virtualRows = rowVirtualizer.getVirtualItems();

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
                  rowTop={rowResizing.getRowTop(virtualRow.index)}
                  columnIndex={columnIndex}
                  rowHeight={rowResizing.getRowHeight(virtualRow.index)}
                  loading={areCellsLoading}
                  isLastInRow={columnIndex === visibleCells.length - 1}
                  isLastInColumn={virtualRow.index === lastRowIndex}
                />
              ));
            })}
            {ghosts != null && (
              <TableGhostCells
                table={table}
                ghosts={ghosts}
                loading={areCellsLoading}
                rowIndices={virtualRows.map((virtualRow) => virtualRow.index)}
                rowResizing={rowResizing}
              />
            )}
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
