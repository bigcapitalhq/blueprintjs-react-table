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

export type TableReorderGuidesProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  reorderingColumnId: string | null;
  guideIndex: number | null;
  rowHeaderWidth: number;
};

export function TableReorderGuides<TData extends BP_RowData>({
  table,
  reorderingColumnId,
  guideIndex,
  rowHeaderWidth,
}: TableReorderGuidesProps<TData>) {
  if (reorderingColumnId == null || guideIndex == null) {
    return null;
  }

  const columns = table.getVisibleLeafColumns();
  const guideX = guideIndex < columns.length ? columns[guideIndex].getStart() : table.getTotalSize();

  return (
    <div className={classNames(TABLE_RESIZE_GUIDES, TABLE_OVERLAY_LAYER)}>
      <div className={classNames(TABLE_OVERLAY, TABLE_VERTICAL_GUIDE)} style={{ left: rowHeaderWidth + guideX }} />
    </div>
  );
}
