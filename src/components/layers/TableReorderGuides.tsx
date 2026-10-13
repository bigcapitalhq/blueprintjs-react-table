import classNames from 'classnames';
import {
  TABLE_OVERLAY,
  TABLE_OVERLAY_LAYER,
  TABLE_RESIZE_GUIDES,
  TABLE_VERTICAL_GUIDE,
} from '../common/classes.ts';
import {
  getFrozenColumnsWidth,
  getRegionWidth,
} from '../common/pinning.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

export type TableReorderGuidesProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  reorderingColumnId: string | null;
  guideIndex: number | null;
  rowHeaderWidth: number;
  /** Current horizontal scroll offset of the main quadrant. */
  scrollLeft: number;
};

/**
 * Preview guide shown while a column is being dragged. `guideIndex` is a
 * boundary in the natural column order (0..numColumns); the guide is drawn at
 * the display offset of that boundary. Boundaries inside the frozen region are
 * fixed, while boundaries in the scrollable region follow the main quadrant's
 * horizontal scroll offset — mirroring Blueprint's quadrant-aware guide.
 */
export function TableReorderGuides<TData extends BP_RowData>({
  table,
  reorderingColumnId,
  guideIndex,
  rowHeaderWidth,
  scrollLeft,
}: TableReorderGuidesProps<TData>) {
  if (reorderingColumnId == null || guideIndex == null) {
    return null;
  }

  const columns = table.getVisibleLeafColumns();
  const frozenColumnCount = table.getStartVisibleLeafColumns().length;
  const guideColumn = columns[guideIndex];
  const frozenColumnsWidth = getFrozenColumnsWidth(table);

  let guideX: number;
  if (guideIndex <= frozenColumnCount) {
    // The boundary sits inside (or at the end of) the frozen region, which
    // never scrolls.
    guideX =
      guideIndex < frozenColumnCount && guideColumn != null
        ? guideColumn.getStart('start')
        : frozenColumnsWidth;
  } else if (guideColumn != null) {
    guideX = frozenColumnsWidth + guideColumn.getStart('center') - scrollLeft;
  } else {
    // The boundary sits after every column.
    guideX = frozenColumnsWidth + getRegionWidth(table, 'center') - scrollLeft;
  }

  return (
    <div className={classNames(TABLE_RESIZE_GUIDES, TABLE_OVERLAY_LAYER)}>
      <div
        className={classNames(TABLE_OVERLAY, TABLE_VERTICAL_GUIDE)}
        style={{ left: rowHeaderWidth + guideX }}
      />
    </div>
  );
}
