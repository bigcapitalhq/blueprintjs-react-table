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
  rowHeaderWidth: number;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
  rowResizing: RowResizingApi;
  ghosts?: BP_GhostCells;
};

export function TableRowHeaders<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
  areRowHeadersLoading,
  rowVirtualizer,
  rowResizing,
  ghosts,
  className,
  ...restProps
}: TableRowHeadersProps<TData>) {
  const rows = table.getRowModel().rows;
  const totalHeight = rowResizing.totalHeight;
  const lastRowIndex = rows.length - 1;

  const virtualRows = rowVirtualizer?.getVirtualItems();
  // Virtual item offsets include the scroll margin (the header area above the
  // body inside the shared scroll container); subtract it to align with the
  // body's coordinate space.
  const scrollMargin = rowVirtualizer?.options.scrollMargin ?? 0;
  const paddingTop =
    virtualRows != null && virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows != null && virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1].end - scrollMargin)
      : 0;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_ROW_HEADERS, className)}
      style={{ width: rowHeaderWidth }}
    >
      <div style={{ height: totalHeight }}>
        <div
          className={TABLE_ROW_HEADERS_CELLS_CONTAINER}
          style={{
            height: totalHeight,
            transform: 'translateY(0px)',
            paddingTop,
            paddingBottom,
          }}
        >
          {(virtualRows != null
            ? virtualRows.map((virtualRow) => ({ index: virtualRow.index }))
            : rows.map((_, rowIndex) => ({ index: rowIndex }))
          ).map(({ index }) => (
            <TableRowHeaderCell
              key={rows[index]?.id ?? index}
              rowIndex={index}
              rowHeight={rowResizing.getRowHeight(index)}
              loading={areRowHeadersLoading}
              isLastInColumn={index === lastRowIndex}
              isResizing={rowResizing.resizingRowIndex === index}
              onResizeStart={
                rowResizing.enabled
                  ? (event) => rowResizing.startRowResize(index, event)
                  : undefined
              }
            />
          ))}
          {ghosts != null &&
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
