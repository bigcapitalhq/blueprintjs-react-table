import classNames from 'classnames';
import {
  TABLE_HORIZONTAL_GUIDE,
  TABLE_OVERLAY,
  TABLE_OVERLAY_LAYER,
  TABLE_RESIZE_GUIDES,
  TABLE_VERTICAL_GUIDE,
} from '../common/classes.ts';
import { getColumnDisplayOffset } from '../common/pinning.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

export type TableResizeGuidesProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
  /** Effective height of the column-header area; offsets the horizontal guide into the body's coordinate space. */
  columnHeaderHeight: number;
  /** Current horizontal scroll offset of the main quadrant. */
  scrollLeft: number;
  /** Current vertical scroll offset of the main quadrant. */
  scrollTop: number;
  /** Number of frozen rows; rows before it never scroll vertically. */
  frozenRowCount: number;
  /** Absolute top of the horizontal guide while resizing a row, or `null`. */
  resizingGuideTop?: number | null;
  /** Absolute index of the row being resized, or `null`. */
  resizingRowIndex?: number | null;
};

/**
 * Resize guides for the whole table. The layers live at the quadrant-stack
 * level so a guide can span across the frozen and scrollable regions; the
 * display offsets of the columns/rows they track are derived from the main
 * quadrant's scroll offsets.
 */
export function TableResizeGuides<TData extends BP_RowData>({
  table,
  rowHeaderWidth,
  columnHeaderHeight,
  scrollLeft,
  scrollTop,
  frozenRowCount,
  resizingGuideTop = null,
  resizingRowIndex = null,
}: TableResizeGuidesProps<TData>) {
  const columnResizing = table.state.columnResizing;
  const resizingColumnId = columnResizing?.isResizingColumn;
  const resizingColumn =
    resizingColumnId != null && resizingColumnId !== false
      ? table.getColumn(resizingColumnId)
      : undefined;
  const columnOffset =
    resizingColumn != null
      ? rowHeaderWidth +
        getColumnDisplayOffset(table, resizingColumn, scrollLeft) +
        resizingColumn.getSize() +
        (columnResizing?.deltaOffset ?? 0)
      : null;

  // Rows in the scrollable region are shifted up by the vertical scroll
  // offset; frozen rows are always in place.
  const rowOffset =
    resizingGuideTop != null && resizingRowIndex != null
      ? columnHeaderHeight + resizingGuideTop - (resizingRowIndex < frozenRowCount ? 0 : scrollTop)
      : null;

  if (columnOffset == null && rowOffset == null) {
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
      {rowOffset != null && (
        <div
          className={classNames(TABLE_OVERLAY, TABLE_HORIZONTAL_GUIDE)}
          style={{ top: rowOffset }}
        />
      )}
    </div>
  );
}
