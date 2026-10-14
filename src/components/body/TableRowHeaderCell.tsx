import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { type Row } from '@tanstack/react-table';
import { LoadableContent } from '../common/LoadableContent.tsx';
import { useTableSelection } from '../common/table-selection-context.ts';
import {
  TABLE_DRAGGING,
  TABLE_HEADER,
  TABLE_LAST_IN_COLUMN,
  TABLE_RESIZE_HANDLE,
  TABLE_RESIZE_HANDLE_TARGET,
  TABLE_RESIZE_HORIZONTAL,
  TABLE_ROW_NAME,
  TABLE_ROW_NAME_TEXT,
  TABLE_ROW_SELECTED,
  rowCellIndexClass,
} from '../common/classes.ts';
import type { RowResizeStartEvent } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  HTMLPropsRef,
} from '../../types.ts';

export type TableRowHeaderCellProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  /**
   * The TanStack row rendered by this header, used for the row-selection
   * highlight. Undefined only while the row model has no row at this index.
   */
  row?: Row<BP_TableFeatures, TData>;
  rowIndex: number;
  rowHeight: number;
  loading: boolean;
  isLastInColumn: boolean;
  /** Whether this row is currently being resized. */
  isResizing?: boolean;
  /** Handler for the horizontal resize handle; when undefined, the handle is hidden. */
  onResizeStart?: (event: RowResizeStartEvent) => void;
};

export function TableRowHeaderCell<TData extends BP_RowData>({
  row,
  rowIndex,
  rowHeight,
  loading,
  isLastInColumn,
  isResizing = false,
  onResizeStart,
  className,
  ...restProps
}: TableRowHeaderCellProps<TData>) {
  const selection = useTableSelection();
  return (
    <div
      {...restProps}
      className={classNames(TABLE_HEADER, rowCellIndexClass(rowIndex), {
        [TABLE_LAST_IN_COLUMN]: isLastInColumn,
        [Classes.LOADING]: loading,
        [TABLE_ROW_SELECTED]: row?.getIsSelected() ?? false,
      }, className)}
      style={{ flexBasis: rowHeight, height: rowHeight, minHeight: 0 }}
      onMouseDown={(event) => selection?.handleRowHeaderMouseDown(rowIndex, event)}
    >
      <div className={TABLE_ROW_NAME}>
        <div className={TABLE_ROW_NAME_TEXT}>
          <LoadableContent loading={loading}>
            <span>{rowIndex + 1}</span>
          </LoadableContent>
        </div>
      </div>
      {!loading && onResizeStart != null && (
        <div
          className={classNames(TABLE_RESIZE_HANDLE_TARGET, TABLE_RESIZE_HORIZONTAL, {
            [TABLE_DRAGGING]: isResizing,
          })}
          onMouseDown={onResizeStart}
          onTouchStart={onResizeStart}
        >
          <div className={classNames(TABLE_RESIZE_HANDLE, { [TABLE_DRAGGING]: isResizing })} />
        </div>
      )}
    </div>
  );
}
