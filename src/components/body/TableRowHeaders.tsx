import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { LoadableContent } from '../common/LoadableContent.tsx';
import {
  TABLE_HEADER,
  TABLE_ROW_HEADERS,
  TABLE_ROW_HEADERS_CELLS_CONTAINER,
  TABLE_ROW_NAME,
  TABLE_ROW_NAME_TEXT,
  rowCellIndexClass,
} from '../common/classes.ts';
import { getFrozenRowCount, type RowRegion } from '../common/pinning.ts';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableRowHeaderCell } from './TableRowHeaderCell.tsx';

export type TableRowHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  /** Which row region this row header renders: frozen ("top") or scrollable ("center"). */
  rowRegion: RowRegion;
  rowHeaderWidth: number;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
  ghosts?: BP_GhostCells;
};

/**
 * Renders the row-header cells of one quadrant's row region. Rows keep their
 * absolute indices (so labels, selection, and styling are stable across
 * regions); scrollable ("center") rows are virtualized with the shared row
 * virtualizer, while frozen rows are always rendered.
 */
export function TableRowHeaders<TData extends BP_RowData>({
  table,
  rowRegion,
  rowHeaderWidth,
  areRowHeadersLoading,
  rowVirtualizer,
  rowResizing,
  ghosts,
  className,
  ...restProps
}: TableRowHeadersProps<TData>) {
  const rows = table.getRowModel().rows;
  const frozenRowCount = getFrozenRowCount(table);
  const isTopRegion = rowRegion === 'top';
  const regionStart = isTopRegion ? 0 : frozenRowCount;
  const regionRowCount = isTopRegion ? frozenRowCount : rows.length - frozenRowCount;
  const regionHeight = isTopRegion
    ? rowResizing.getRowTop(frozenRowCount)
    : rowResizing.totalHeight - rowResizing.getRowTop(frozenRowCount);

  const isVirtualized = !isTopRegion && rowVirtualizer != null;
  const virtualRows = isVirtualized ? rowVirtualizer.getVirtualItems() : undefined;
  // Virtual item offsets include the scroll margin (the column-header area and
  // frozen rows above the scrollable body); subtract it to align with the
  // region's coordinate space.
  const scrollMargin = rowVirtualizer?.options.scrollMargin ?? 0;
  const paddingTop =
    virtualRows != null && virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows != null && virtualRows.length > 0
      ? regionHeight - (virtualRows[virtualRows.length - 1].end - scrollMargin)
      : 0;

  const renderedRowIndices =
    virtualRows != null
      ? virtualRows.map((virtualRow) => frozenRowCount + virtualRow.index)
      : Array.from({ length: regionRowCount }, (_, index) => regionStart + index);
  const lastRowIndex = isTopRegion ? frozenRowCount - 1 : rows.length - 1;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_ROW_HEADERS, className)}
      style={{ width: rowHeaderWidth }}
    >
      <div style={{ height: regionHeight }}>
        <div
          className={TABLE_ROW_HEADERS_CELLS_CONTAINER}
          style={{
            height: regionHeight,
            transform: 'translateY(0px)',
            paddingTop,
            paddingBottom,
          }}
        >
          {renderedRowIndices.map((rowIndex) => (
            <TableRowHeaderCell
              key={rows[rowIndex]?.id ?? rowIndex}
              rowIndex={rowIndex}
              rowHeight={rowResizing.getRowHeight(rowIndex)}
              loading={areRowHeadersLoading}
              isLastInColumn={rowIndex === lastRowIndex}
              isResizing={rowResizing.resizingRowIndex === rowIndex}
              onResizeStart={
                rowResizing.enabled
                  ? (event) => rowResizing.startRowResize(rowIndex, event)
                  : undefined
              }
            />
          ))}
          {ghosts != null &&
            !isTopRegion &&
            Array.from({ length: ghosts.rowCount }).map((_, ghostRowOffset) => {
              const rowIndex = rows.length + ghostRowOffset;
              return (
                <div
                  key={`ghost-row-header-${ghostRowOffset}`}
                  className={classNames(TABLE_HEADER, rowCellIndexClass(rowIndex), {
                    [Classes.LOADING]: areRowHeadersLoading,
                  })}
                  style={{ flexBasis: ghosts.rowHeight, height: ghosts.rowHeight, minHeight: 0 }}
                >
                  <div className={TABLE_ROW_NAME}>
                    <div className={TABLE_ROW_NAME_TEXT}>
                      <LoadableContent loading={areRowHeadersLoading} />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
