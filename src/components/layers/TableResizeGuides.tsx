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
import type { ColumnRegion } from '../common/pinning.ts';
import {
  columnToNaturalIndex,
  columnToPixelOffset,
  getFrozenColumnCount,
} from '../common/pinning.ts';

export type TableResizeGuidesProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  columnRegion: ColumnRegion;
  /** x-offset of the quadrant within the full grid (frozen width for "center"). */
  offsetLeft: number;
  rowHeaderWidth: number;
};

export function TableResizeGuides<TData extends BP_RowData>({
  table,
  columnRegion,
  offsetLeft,
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

  const naturalIndex = columnToNaturalIndex(table, column);
  const frozenColumnCount = getFrozenColumnCount(table);
  const isInRegion = columnRegion === 'start' ? naturalIndex < frozenColumnCount : naturalIndex >= frozenColumnCount;
  if (!isInRegion) {
    return null;
  }

  const boundary =
    columnToPixelOffset(table, naturalIndex) + column.getSize() + (columnResizing?.deltaOffset ?? 0);

  return (
    <div className={classNames(TABLE_RESIZE_GUIDES, TABLE_OVERLAY_LAYER)}>
      <div
        className={classNames(TABLE_OVERLAY, TABLE_VERTICAL_GUIDE)}
        style={{ left: rowHeaderWidth + boundary - offsetLeft }}
      />
    </div>
  );
}