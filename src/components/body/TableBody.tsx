import classNames from 'classnames';
import { ContextMenu } from '@blueprintjs/core';
import {
  TABLE_BODY_CELLS,
  TABLE_BODY_VIRTUAL_CLIENT,
  TABLE_CELL_CLIENT,
  TABLE_QUADRANT_BODY_CONTAINER,
} from '../common/classes.ts';
import {
  getFrozenRowCount,
  getRegionWidth,
  type ColumnRegion,
  type RowRegion,
} from '../common/pinning.ts';
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

export type TableBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  /** Which column region this body renders: frozen ("start") or scrollable ("center"). */
  columnRegion: ColumnRegion;
  /** Which row region this body renders: frozen ("top") or scrollable ("center"). */
  rowRegion: RowRegion;
  /** Vertical padding that places the body inside its quadrant's scroll content. */
  offsetTop?: number;
  /** Horizontal padding that places the body inside its quadrant's scroll content. */
  offsetLeft?: number;
  areCellsLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
  ghosts?: BP_GhostCells;
};

/**
 * Renders the body cells of one quadrant. The quadrant determines the column
 * and row regions; cells are grouped in their region's coordinate space (the
 * region's first column/row is at offset zero) and padded by `offsetTop` /
 * `offsetLeft` so that quadrants with scrollable content share the main
 * quadrant's scroll ranges. Scrollable ("center") rows are virtualized when
 * the table is virtualized; frozen rows are always rendered.
 */
export function TableBody<TData extends BP_RowData>({
  table,
  columnRegion,
  rowRegion,
  offsetTop = 0,
  offsetLeft = 0,
  areCellsLoading,
  rowVirtualizer,
  rowResizing,
  ghosts,
  className,
  ...restProps
}: TableBodyProps<TData>) {
  const selection = useTableSelection();
  const isBodyContextMenuEnabled = selection != null && selection.isBodyContextMenuEnabled;
  const rows = table.getRowModel().rows;
  const frozenRowCount = getFrozenRowCount(table);
  const isTopRegion = rowRegion === 'top';
  const regionRowCount = isTopRegion ? frozenRowCount : rows.length - frozenRowCount;
  const regionTop = isTopRegion ? 0 : rowResizing.getRowTop(frozenRowCount);
  const regionHeight = isTopRegion
    ? rowResizing.getRowTop(frozenRowCount)
    : rowResizing.totalHeight - rowResizing.getRowTop(frozenRowCount);
  const regionWidth = getRegionWidth(table, columnRegion);

  const isVirtualized = !isTopRegion && rowVirtualizer != null;
  const virtualRows = isVirtualized ? rowVirtualizer.getVirtualItems() : undefined;
  const renderedRowIndices =
    virtualRows != null
      ? virtualRows.map((virtualRow) => frozenRowCount + virtualRow.index)
      : Array.from({ length: regionRowCount }, (_, index) =>
          isTopRegion ? index : frozenRowCount + index,
        );
  const lastRowIndex = isTopRegion ? frozenRowCount - 1 : rows.length - 1;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_QUADRANT_BODY_CONTAINER, className)}
      style={{ paddingLeft: offsetLeft, paddingTop: offsetTop }}
    >
      <div>
        <ContextMenu
          className={classNames(TABLE_BODY_VIRTUAL_CLIENT, TABLE_CELL_CLIENT)}
          style={{ height: regionHeight, width: regionWidth }}
          onPointerDown={selection?.handleBodyPointerDown}
          onPointerMove={selection?.handleBodyPointerMove}
          onPointerUp={selection?.handleBodyPointerUp}
          onPointerCancel={selection?.handleBodyPointerCancel}
          disabled={!isBodyContextMenuEnabled}
          onContextMenu={isBodyContextMenuEnabled ? selection?.handleBodyContextMenu : undefined}
          content={({ mouseEvent }) =>
            mouseEvent == null ? undefined : selection?.renderBodyContextMenu(mouseEvent)
          }
        >
          <div className={TABLE_BODY_CELLS}>
            {renderedRowIndices.map((rowIndex) => {
              const row = rows[rowIndex];
              if (row == null) {
                return null;
              }
              const cells =
                columnRegion === 'start' ? row.getStartVisibleCells() : row.getCenterVisibleCells();
              const rowTop = rowResizing.getRowTop(rowIndex) - regionTop;
              const rowHeight = rowResizing.getRowHeight(rowIndex);
              return cells.map((cell, columnIndex) => (
                <TableBodyCell
                  key={cell.id}
                  table={table}
                  cell={cell}
                  rowIndex={rowIndex}
                  rowTop={rowTop}
                  columnRegion={columnRegion}
                  rowHeight={rowHeight}
                  loading={areCellsLoading}
                  isLastInRow={columnIndex === cells.length - 1}
                  isLastInColumn={rowIndex === lastRowIndex}
                />
              ));
            })}
            {ghosts != null && (
              <TableGhostCells
                table={table}
                ghosts={ghosts}
                loading={areCellsLoading}
                columnRegion={columnRegion}
                rowRegion={rowRegion}
                rowIndices={renderedRowIndices}
                regionTop={regionTop}
                regionHeight={regionHeight}
                getRowTop={rowResizing.getRowTop}
                getRowHeight={rowResizing.getRowHeight}
              />
            )}
          </div>
          {selection != null && selection.regionGroups.length > 0 && (
            <TableRegionLayer
              table={table}
              regionGroups={selection.regionGroups}
              columnRegion={columnRegion}
              rowRegion={rowRegion}
              getRowTop={rowResizing.getRowTop}
              getRowHeight={rowResizing.getRowHeight}
            />
          )}
        </ContextMenu>
      </div>
    </div>
  );
}
