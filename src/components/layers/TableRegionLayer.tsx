import classNames from 'classnames';
import type { CSSProperties } from 'react';
import {
  TABLE_OVERLAY,
  TABLE_OVERLAY_LAYER,
  TABLE_REGION,
} from '../common/classes.ts';
import {
  RegionCardinality,
  Regions,
  type Region,
  type StyledRegionGroup,
} from '../common/region.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import type { ColumnRegion, RowRegion } from '../common/pinning.ts';
import {
  columnToPixelOffset,
  getFrozenColumnCount,
  getFrozenRowCount,
} from '../common/pinning.ts';

export type TableRegionLayerProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  regionGroups: StyledRegionGroup[];
  rowHeight: number;
  columnRegion: ColumnRegion;
  rowRegion: RowRegion;
  /** x-offset of the quadrant within the full grid (frozen width for "center"). */
  offsetLeft: number;
  /** y-offset of the quadrant within the full grid (frozen rows height for "center"). */
  offsetTop: number;
};

type Interval = [number, number];

function intersectIntervals(a: Interval, b: Interval): Interval | null {
  const start = Math.max(a[0], b[0]);
  const end = Math.min(a[1], b[1]);
  return start <= end ? [start, end] : null;
}

function cumulativeColumnWidth<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  startIndex: number,
  endIndex: number,
): number {
  let width = 0;
  const columns = table.getVisibleLeafColumns();
  for (let i = startIndex; i <= endIndex; i++) {
    width += columns[i]?.getSize() ?? 0;
  }
  return width;
}

function regionToStyle<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: Region,
  rowHeight: number,
  colRange: Interval,
  rowRange: Interval,
  offsetLeft: number,
  offsetTop: number,
): CSSProperties | null {
  const cardinality = Regions.getRegionCardinality(region);

  let cols: Interval | null = null;
  let rows: Interval | null = null;

  switch (cardinality) {
    case RegionCardinality.CELLS:
      cols = intersectIntervals(region.cols! as Interval, colRange);
      rows = intersectIntervals(region.rows! as Interval, rowRange);
      break;
    case RegionCardinality.FULL_COLUMNS:
      cols = intersectIntervals(region.cols! as Interval, colRange);
      rows = rowRange;
      break;
    case RegionCardinality.FULL_ROWS:
      cols = colRange;
      rows = intersectIntervals(region.rows! as Interval, rowRange);
      break;
    case RegionCardinality.FULL_TABLE:
      cols = colRange;
      rows = rowRange;
      break;
    default:
      return null;
  }

  if (cols == null || rows == null) {
    return null;
  }

  return {
    height: (rows[1] - rows[0] + 1) * rowHeight,
    left: columnToPixelOffset(table, cols[0]) - offsetLeft,
    top: rows[0] * rowHeight - offsetTop,
    width: cumulativeColumnWidth(table, cols[0], cols[1]),
  };
}

export function TableRegionLayer<TData extends BP_RowData>({
  table,
  regionGroups,
  rowHeight,
  columnRegion,
  rowRegion,
  offsetLeft,
  offsetTop,
}: TableRegionLayerProps<TData>) {
  const totalColumns = table.getVisibleLeafColumns().length;
  const totalRows = table.getRowModel().rows.length;
  const frozenColumnCount = getFrozenColumnCount(table);
  const frozenRowCount = getFrozenRowCount(table);

  const colRange: Interval =
    columnRegion === 'start' ? [0, frozenColumnCount - 1] : [frozenColumnCount, totalColumns - 1];
  const rowRange: Interval =
    rowRegion === 'top' ? [0, frozenRowCount - 1] : [frozenRowCount, totalRows - 1];

  if (colRange[0] > colRange[1] || rowRange[0] > rowRange[1]) {
    return null;
  }

  return (
    <div className={TABLE_OVERLAY_LAYER} aria-hidden>
      {regionGroups.map((group, groupIndex) =>
        group.regions.map((region, regionIndex) => {
          const style = regionToStyle(
            table,
            region,
            rowHeight,
            colRange,
            rowRange,
            offsetLeft,
            offsetTop,
          );
          if (style == null) {
            return null;
          }
          return (
            <div
              key={`${groupIndex}-${regionIndex}`}
              className={classNames(TABLE_OVERLAY, TABLE_REGION, group.className)}
              style={style}
            />
          );
        }),
      )}
    </div>
  );
}