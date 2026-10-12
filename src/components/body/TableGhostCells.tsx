import { Fragment } from 'react';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import { TableGhostCell } from './TableGhostCell.tsx';

export type TableGhostCellsProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  ghosts: BP_GhostCells;
  loading: boolean;
  /** Indices of the data rows rendered alongside the ghost cells. */
  rowIndices: number[];
  rowResizing: RowResizingApi;
};

/**
 * Renders the ghost-cell "L" region that fills leftover viewport space when
 * ghost cells are enabled: empty columns to the right of the data (for the
 * rendered data rows), empty rows below the data, and the corner block shared
 * by both. Mirrors Blueprint's ghost cells, which use the default row height /
 * column width regardless of the sizes of adjacent rows/columns.
 */
export function TableGhostCells<TData extends BP_RowData>({
  table,
  ghosts,
  loading,
  rowIndices,
  rowResizing,
}: TableGhostCellsProps<TData>) {
  const rows = table.getRowModel().rows;
  const columns = table.getVisibleLeafColumns();
  const numColumns = columns.length;
  const totalWidth = table.getTotalSize();
  const totalHeight = rowResizing.totalHeight;

  return (
    <>
      {/* Ghost columns alongside the rendered data rows. */}
      {rowIndices.map((rowIndex) => (
        <Fragment key={`ghost-column-cells-${rows[rowIndex]?.id ?? rowIndex}`}>
          {Array.from({ length: ghosts.columnCount }).map((_, ghostColumnOffset) => (
            <TableGhostCell
              key={`ghost-column-cell-${rowIndex}-${ghostColumnOffset}`}
              columnIndex={numColumns + ghostColumnOffset}
              rowIndex={rowIndex}
              left={totalWidth + ghostColumnOffset * ghosts.columnWidth}
              top={rowResizing.getRowTop(rowIndex)}
              width={ghosts.columnWidth}
              height={rowResizing.getRowHeight(rowIndex)}
              loading={loading}
            />
          ))}
        </Fragment>
      ))}

      {/* Ghost rows below the data, across all columns and ghost columns. */}
      {Array.from({ length: ghosts.rowCount }).map((_, ghostRowOffset) => {
        const rowIndex = rows.length + ghostRowOffset;
        const top = totalHeight + ghostRowOffset * ghosts.rowHeight;
        return (
          <Fragment key={`ghost-row-cells-${ghostRowOffset}`}>
            {columns.map((column, columnIndex) => (
              <TableGhostCell
                key={`ghost-row-cell-${ghostRowOffset}-${column.id}`}
                columnIndex={columnIndex}
                rowIndex={rowIndex}
                left={column.getStart()}
                top={top}
                width={column.getSize()}
                height={ghosts.rowHeight}
                loading={loading}
              />
            ))}
            {Array.from({ length: ghosts.columnCount }).map((_, ghostColumnOffset) => (
              <TableGhostCell
                key={`ghost-corner-cell-${ghostRowOffset}-${ghostColumnOffset}`}
                columnIndex={numColumns + ghostColumnOffset}
                rowIndex={rowIndex}
                left={totalWidth + ghostColumnOffset * ghosts.columnWidth}
                top={top}
                width={ghosts.columnWidth}
                height={ghosts.rowHeight}
                loading={loading}
              />
            ))}
          </Fragment>
        );
      })}
    </>
  );
}
