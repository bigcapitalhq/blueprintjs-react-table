import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { DragHandleVerticalIcon } from '@blueprintjs/icons';
import { type Header } from '@tanstack/react-table';
import { LoadableContent } from '../common/LoadableContent.tsx';
import {
  TABLE_COLUMN_HEADER_CELL,
  TABLE_COLUMN_NAME,
  TABLE_COLUMN_NAME_TEXT,
  TABLE_DRAGGING,
  TABLE_HAS_REORDER_HANDLE,
  TABLE_HEADER,
  TABLE_HEADER_CONTENT,
  TABLE_LAST_IN_ROW,
  TABLE_REORDER_HANDLE,
  TABLE_REORDER_HANDLE_TARGET,
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
import { useTableColumnReorder } from './table-column-reorder-context.ts';
import { useTableSelection } from '../common/table-selection-context.ts';

export type TableHeadCellProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  header: Header<BP_TableFeatures, TData, unknown>;
  isLastInRow: boolean;
  loading: boolean;
};

export function TableHeadCell<TData extends BP_RowData>({
  table,
  header,
  isLastInRow,
  loading,
}: TableHeadCellProps<TData>) {
  const size = header.getSize();
  const isResizing = header.column.getIsResizing();
  const handleResizeStart = header.getResizeHandler();
  const name =
    typeof header.column.columnDef.header === 'string'
      ? header.column.columnDef.header
      : undefined;
  const reorder = useTableColumnReorder();
  const selection = useTableSelection();
  const isReorderable = reorder?.enableColumnReordering ?? false;
  const isReordering = reorder?.reorderingColumnId === header.column.id;

  return (
    <div
      className={classNames(
        TABLE_HEADER,
        columnCellIndexClass(header.index),
        TABLE_COLUMN_HEADER_CELL,
        { [TABLE_LAST_IN_ROW]: isLastInRow },
        { [TABLE_HAS_REORDER_HANDLE]: isReorderable },
        { [Classes.LOADING]: loading },
      )}
      style={{ flexBasis: size, minWidth: 0, width: size }}
      onMouseDown={(event) => selection?.handleColumnHeaderMouseDown(header.index, event)}
    >
      <div className={TABLE_COLUMN_NAME} title={name}>
        {isReorderable && (
          <div
            className={classNames(TABLE_REORDER_HANDLE_TARGET, { [TABLE_DRAGGING]: isReordering })}
            onPointerDown={(event) => reorder?.startReorder(header.column, event)}
          >
            <div className={TABLE_REORDER_HANDLE}>
              <DragHandleVerticalIcon title="Press down to drag" />
            </div>
          </div>
        )}
        <div className={TABLE_COLUMN_NAME_TEXT}>
          <LoadableContent loading={loading} variableLength>
            <table.FlexRender header={header} />
          </LoadableContent>
        </div>
      </div>
      <div className={TABLE_HEADER_CONTENT} />
      {!loading && (
        <div
          className={classNames(TABLE_RESIZE_HANDLE_TARGET, TABLE_RESIZE_VERTICAL, {
            [TABLE_DRAGGING]: isResizing,
          })}
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className={classNames(TABLE_RESIZE_HANDLE, { [TABLE_DRAGGING]: isResizing })} />
        </div>
      )}
    </div>
  );
}
