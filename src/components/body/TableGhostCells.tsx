import { Fragment } from 'react';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import {
  getRegionColumns,
  getRegionWidth,
  type ColumnRegion,
  type RowRegion,
} from '../common/pinning.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import { TableGhostCell } from './TableGhostCell.tsx';

export type TableGhostCellsProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  ghosts: BP_GhostCells;
  loading: boolean;
  columnRegion: ColumnRegion;
  rowRegion: RowRegion;
  /** Absolute indices of the data rows rendered alongside the ghost columns. */
  rowIndices: number[];
  /** Absolute top offset of this quadrant's row region. */
  regionTop: number;
  /** Total height of this quadrant's row region. */
  regionHeight: number;
  /** Resolved absolute top offset of the row at the given index. */
  getRowTop: (index: number) => number;
  /** Resolved height of the row at the given index. */
  getRowHeight: (index: number) => number;
};

/**
 * Renders the ghost-cell "L" region that fills leftover viewport space when
 * ghost cells are enabled: empty columns to the right of the data (for the
 * rendered data rows), empty rows below the data, and the corner block shared
 * by both. Mirrors Blueprint's ghost cells, which use the default row height /
 * column width regardless of the sizes of adjacent rows/columns.
 *
 * Each quadrant renders the part of the ghost region that belongs to it:
 * ghost columns only exist in the scrollable ("center") column region (they
 * follow the last data column) and ghost rows only exist in the scrollable
 * ("center") row region (they follow the last data row).
 */
export function TableGhostCells<TData extends BP_RowData>({
  table,
  ghosts,
  loading,
  columnRegion,
  rowRegion,
  rowIndices,
  regionTop,
  regionHeight,
  getRowTop,
  getRowHeight,
}: TableGhostCellsProps<TData>) {
  const rows = table.getRowModel().rows;
  const numColumns = table.getVisibleLeafColumns().length;
  const regionWidth = getRegionWidth(table, columnRegion);
  const regionColumns = getRegionColumns(table, columnRegion);

  const showsGhostColumns = columnRegion === 'center';
  const showsGhostRows = rowRegion === 'center';

  return (
    <>
      {/* Ghost columns alongside the rendered data rows. */}
      {showsGhostColumns &&
        rowIndices.map((rowIndex) => (
          <Fragment key={`ghost-column-cells-${rows[rowIndex]?.id ?? rowIndex}`}>
            {Array.from({ length: ghosts.columnCount }).map((_, ghostColumnOffset) => (
              <TableGhostCell
                key={`ghost-column-cell-${rowIndex}-${ghostColumnOffset}`}
                columnIndex={numColumns + ghostColumnOffset}
                rowIndex={rowIndex}
                left={regionWidth + ghostColumnOffset * ghosts.columnWidth}
                top={getRowTop(rowIndex) - regionTop}
                width={ghosts.columnWidth}
                height={getRowHeight(rowIndex)}
                loading={loading}
              />
            ))}
          </Fragment>
        ))}

      {/* Ghost rows below the data, across all columns of this region and its ghost columns. */}
      {showsGhostRows &&
        Array.from({ length: ghosts.rowCount }).map((_, ghostRowOffset) => {
          const rowIndex = rows.length + ghostRowOffset;
          const top = regionHeight + ghostRowOffset * ghosts.rowHeight;
          return (
            <Fragment key={`ghost-row-cells-${ghostRowOffset}`}>
              {regionColumns.map((column) => (
                <TableGhostCell
                  key={`ghost-row-cell-${ghostRowOffset}-${column.id}`}
                  columnIndex={column.getIndex()}
                  rowIndex={rowIndex}
                  left={column.getStart(columnRegion)}
                  top={top}
                  width={column.getSize()}
                  height={ghosts.rowHeight}
                  loading={loading}
                />
              ))}
              {showsGhostColumns &&
                Array.from({ length: ghosts.columnCount }).map((_, ghostColumnOffset) => (
                  <TableGhostCell
                    key={`ghost-corner-cell-${ghostRowOffset}-${ghostColumnOffset}`}
                    columnIndex={numColumns + ghostColumnOffset}
                    rowIndex={rowIndex}
                    left={regionWidth + ghostColumnOffset * ghosts.columnWidth}
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
