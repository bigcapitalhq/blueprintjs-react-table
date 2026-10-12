import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { LoadableContent } from '../common/LoadableContent.tsx';
import {
  TABLE_CELL,
  TABLE_CELL_GHOST,
  TABLE_CELL_LEDGER_EVEN,
  TABLE_CELL_LEDGER_ODD,
  TABLE_NO_WRAP_TEXT,
  TABLE_TRUNCATED_CELL,
  TABLE_TRUNCATED_TEXT,
  columnCellIndexClass,
  rowCellIndexClass,
} from '../common/classes.ts';

export type TableGhostCellProps = {
  /** Absolute column index (data columns first, then ghost columns). */
  columnIndex: number;
  /** Absolute row index (data rows first, then ghost rows). */
  rowIndex: number;
  /** Absolute left offset within the body's virtual client. */
  left: number;
  /** Absolute top offset within the body's virtual client. */
  top: number;
  width: number;
  height: number;
  loading: boolean;
};

/**
 * An empty cell rendered beyond the data rows/columns to fill leftover
 * viewport space when ghost cells are enabled (mirroring Blueprint's ghost
 * cells). Ghost cells are not interactive: they render no content and carry no
 * selection handlers, and `getCellFromPoint` ignores points beyond the grid.
 */
export function TableGhostCell({
  columnIndex,
  rowIndex,
  left,
  top,
  width,
  height,
  loading,
}: TableGhostCellProps) {
  return (
    <div
      className={classNames(
        TABLE_CELL,
        TABLE_CELL_GHOST,
        TABLE_TRUNCATED_CELL,
        rowCellIndexClass(rowIndex),
        columnCellIndexClass(columnIndex),
        rowIndex % 2 === 0 ? TABLE_CELL_LEDGER_EVEN : TABLE_CELL_LEDGER_ODD,
        { [Classes.LOADING]: loading },
      )}
      style={{ height, left, position: 'absolute', top, width }}
    >
      <div className={classNames(TABLE_TRUNCATED_TEXT, TABLE_NO_WRAP_TEXT)}>
        <LoadableContent loading={loading} variableLength />
      </div>
    </div>
  );
}
