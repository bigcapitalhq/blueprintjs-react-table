import classNames from 'classnames';
import {
  TABLE_HORIZONTAL_GUIDE,
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
  /** Absolute top of the horizontal guide while resizing a row, or `null`. */
  resizingGuideTop?: number | null;
  /** Height of the column-header area; offsets the horizontal guide into the body's coordinate space. */
  columnHeaderHeight?: number;
  /** Width of the row-header/menu area; offsets the vertical guide into the body's coordinate space. */
  rowHeaderWidth?: number;
};

export function TableResizeGuides<TData extends BP_RowData>({
  table,
  resizingGuideTop = null,
  columnHeaderHeight = 0,
  rowHeaderWidth = 0,
}: TableResizeGuidesProps<TData>) {
  const columnResizing = table.state.columnResizing;
  const resizingColumnId = columnResizing?.isResizingColumn;
  const resizingColumn = resizingColumnId != null && resizingColumnId !== false
    ? table.getColumn(resizingColumnId)
    : undefined;
  const columnOffset = resizingColumn != null
    ? rowHeaderWidth +
      resizingColumn.getStart() +
      resizingColumn.getSize() +
      (columnResizing?.deltaOffset ?? 0)
    : null;

  if (columnOffset == null && resizingGuideTop == null) {
    return null;
  }

  return (
    <div className={classNames(TABLE_RESIZE_GUIDES, TABLE_OVERLAY_LAYER)}>
      {columnOffset != null && (
        <div
          className={classNames(TABLE_OVERLAY, TABLE_VERTICAL_GUIDE)}
          style={{ left: columnOffset }}
        />
      )}
      {resizingGuideTop != null && (
        <div
          className={classNames(TABLE_OVERLAY, TABLE_HORIZONTAL_GUIDE)}
          style={{ top: columnHeaderHeight + resizingGuideTop }}
        />
      )}
    </div>
  );
}
