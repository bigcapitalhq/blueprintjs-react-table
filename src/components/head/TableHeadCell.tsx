import classNames from 'classnames';
import { type Header } from '@tanstack/react-table';
import {
  TABLE_COLUMN_HEADER_CELL,
  TABLE_COLUMN_NAME,
  TABLE_COLUMN_NAME_TEXT,
  TABLE_DRAGGING,
  TABLE_HEADER,
  TABLE_HEADER_CONTENT,
  TABLE_LAST_IN_ROW,
  TABLE_RESIZE_HANDLE,
  TABLE_RESIZE_HANDLE_TARGET,
  TABLE_RESIZE_VERTICAL,
  columnCellIndexClass,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';

export type TableHeadCellProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  header: Header<BP_TableFeatures, TData, unknown>;
  isLastInRow: boolean;
};

export function TableHeadCell<TData extends BP_RowData>({
  table,
  header,
  isLastInRow,
}: TableHeadCellProps<TData>) {
  const size = header.getSize();
  const isResizing = header.column.getIsResizing();
  const handleResizeStart = header.getResizeHandler();
  const name =
    typeof header.column.columnDef.header === 'string'
      ? header.column.columnDef.header
      : undefined;

  return (
    <div
      className={classNames(
        TABLE_HEADER,
        columnCellIndexClass(header.index),
        TABLE_COLUMN_HEADER_CELL,
        { [TABLE_LAST_IN_ROW]: isLastInRow },
      )}
      style={{ flexBasis: size, minWidth: 0, width: size }}
    >
      <div className={TABLE_COLUMN_NAME} title={name}>
        <div className={TABLE_COLUMN_NAME_TEXT}>
          <table.FlexRender header={header} />
        </div>
      </div>
      <div className={TABLE_HEADER_CONTENT} />
      <div
        className={classNames(TABLE_RESIZE_HANDLE_TARGET, TABLE_RESIZE_VERTICAL, {
          [TABLE_DRAGGING]: isResizing,
        })}
        onMouseDown={handleResizeStart}
        onTouchStart={handleResizeStart}
      >
        <div className={classNames(TABLE_RESIZE_HANDLE, { [TABLE_DRAGGING]: isResizing })} />
      </div>
    </div>
  );
}
