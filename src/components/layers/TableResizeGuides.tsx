import classNames from 'classnames';
import {
  TABLE_OVERLAY,
  TABLE_OVERLAY_LAYER,
  TABLE_RESIZE_GUIDES,
  TABLE_VERTICAL_GUIDE,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

export type TableResizeGuidesProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
};

export function TableResizeGuides<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
}: TableResizeGuidesProps<TData>) {
  const columnResizing = table.state.columnResizing;
  const resizingColumnId = columnResizing?.isResizingColumn;

  if (!resizingColumnId) {
    return null;
  }

  const column = table.getColumn(resizingColumnId);
  if (!column) {
    return null;
  }

  const offset =
    rowHeaderWidth + column.getStart() + column.getSize() + (columnResizing?.deltaOffset ?? 0);

  return (
    <div className={classNames(TABLE_RESIZE_GUIDES, TABLE_OVERLAY_LAYER)}>
      <div className={classNames(TABLE_OVERLAY, TABLE_VERTICAL_GUIDE)} style={{ left: offset }} />
    </div>
  );
}
