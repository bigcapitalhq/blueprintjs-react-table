import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { type Cell } from '@tanstack/react-table';
import { LoadableContent } from '../common/LoadableContent.tsx';
import {
  TABLE_CELL,
  TABLE_CELL_LEDGER_EVEN,
  TABLE_CELL_LEDGER_ODD,
  TABLE_LAST_IN_COLUMN,
  TABLE_LAST_IN_ROW,
  TABLE_NO_WRAP_TEXT,
  TABLE_TRUNCATED_CELL,
  TABLE_TRUNCATED_TEXT,
  columnCellIndexClass,
  rowCellIndexClass,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';

export type TableBodyCellProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  cell: Cell<BP_TableFeatures, TData, unknown>;
  rowIndex: number;
  /** Absolute top offset of the row within the body's virtual client. */
  rowTop: number;
  columnIndex: number;
  rowHeight: number;
  loading: boolean;
  isLastInRow: boolean;
  isLastInColumn: boolean;
};

export function TableBodyCell<TData extends BP_RowData>({
  table,
  cell,
  rowIndex,
  rowTop,
  columnIndex,
  rowHeight,
  loading,
  isLastInRow,
  isLastInColumn,
}: TableBodyCellProps<TData>) {
  const size = cell.column.getSize();
  const start = cell.column.getStart();
  const bodyCellClassName = cell.column.columnDef.meta?.bodyCellClassName;

  return (
    <div
      className={classNames(
        TABLE_CELL,
        TABLE_TRUNCATED_CELL,
        rowCellIndexClass(rowIndex),
        columnCellIndexClass(columnIndex),
        rowIndex % 2 === 0 ? TABLE_CELL_LEDGER_EVEN : TABLE_CELL_LEDGER_ODD,
        {
          [TABLE_LAST_IN_ROW]: isLastInRow,
          [TABLE_LAST_IN_COLUMN]: isLastInColumn,
          [Classes.LOADING]: loading,
        },
        bodyCellClassName,
      )}
      style={{
        height: rowHeight,
        left: start,
        position: 'absolute',
        top: rowTop,
        width: size,
      }}
    >
      <div className={classNames(TABLE_TRUNCATED_TEXT, TABLE_NO_WRAP_TEXT)}>
        <LoadableContent loading={loading} variableLength>
          <table.FlexRender cell={cell} />
        </LoadableContent>
      </div>
    </div>
  );
}
