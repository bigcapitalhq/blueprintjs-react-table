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
  type CellInterval,
  type Region,
  type StyledRegionGroup,
} from '../common/region.ts';
import {
  getFrozenRowCount,
  getRegionColumns,
  getRegionWidth,
  type ColumnRegion,
  type RowRegion,
} from '../common/pinning.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

export type TableRegionLayerProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  regionGroups: StyledRegionGroup[];
  columnRegion: ColumnRegion;
  rowRegion: RowRegion;
  getRowTop: (index: number) => number;
  getRowHeight: (index: number) => number;
};

type OffsetInterval = { offset: number; size: number };

/** Region-local offset/width of the columns in `interval`, or `null` when none are in the region. */
function getColumnIntervalStyle<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: ColumnRegion,
  interval: CellInterval,
): OffsetInterval | null {
  let offset: number | null = null;
  let size = 0;
  for (const column of getRegionColumns(table, region)) {
    const index = column.getIndex();
    if (index < interval[0] || index > interval[1]) {
      continue;
    }
    if (offset == null) {
      offset = column.getStart(region);
    }
    size += column.getSize();
  }
  return offset == null ? null : { offset, size };
}

/** Region-local offset/height of the rows in `interval`, or `null` when none are in the region. */
function getRowIntervalStyle<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: RowRegion,
  interval: CellInterval,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
): OffsetInterval | null {
  const frozenRowCount = getFrozenRowCount(table);
  const rowCount = table.getRowModel().rows.length;
  const start = Math.max(interval[0], region === 'top' ? 0 : frozenRowCount);
  const end = Math.min(interval[1], region === 'top' ? frozenRowCount - 1 : rowCount - 1);
  if (start > end) {
    return null;
  }
  // Center rows are positioned after the frozen rows within their body.
  const regionOffset = region === 'center' ? getRegionTop(table, region, getRowTop) : 0;
  return {
    offset: getRowTop(start) - regionOffset,
    size: getRowTop(end) + getRowHeight(end) - getRowTop(start),
  };
}

/** Absolute top offset of a row region's first row. */
function getRegionTop<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: RowRegion,
  getRowTop: (index: number) => number,
): number {
  return region === 'center' ? getRowTop(getFrozenRowCount(table)) : 0;
}

function regionToStyle<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: Region,
  columnRegion: ColumnRegion,
  rowRegion: RowRegion,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
): CSSProperties | null {
  const cardinality = Regions.getRegionCardinality(region);
  const fullColumns: OffsetInterval = { offset: 0, size: getRegionWidth(table, columnRegion) };
  const frozenRowCount = getFrozenRowCount(table);
  const rowCount = table.getRowModel().rows.length;
  const fullRows: OffsetInterval = {
    offset: 0,
    size:
      (rowRegion === 'top' ? frozenRowCount : rowCount - frozenRowCount) === 0
        ? 0
        : getRowTop(rowRegion === 'top' ? 0 : frozenRowCount) +
          getRowHeight(rowRegion === 'top' ? frozenRowCount - 1 : rowCount - 1) -
          getRowTop(rowRegion === 'top' ? 0 : frozenRowCount),
  };

  let cols: OffsetInterval | null;
  let rows: OffsetInterval | null;
  switch (cardinality) {
    case RegionCardinality.CELLS:
      cols = getColumnIntervalStyle(table, columnRegion, region.cols! as CellInterval);
      rows = getRowIntervalStyle(table, rowRegion, region.rows! as CellInterval, getRowTop, getRowHeight);
      break;
    case RegionCardinality.FULL_COLUMNS:
      cols = getColumnIntervalStyle(table, columnRegion, region.cols! as CellInterval);
      rows = fullRows;
      break;
    case RegionCardinality.FULL_ROWS:
      cols = fullColumns;
      rows = getRowIntervalStyle(table, rowRegion, region.rows! as CellInterval, getRowTop, getRowHeight);
      break;
    default:
      cols = fullColumns;
      rows = fullRows;
      break;
  }

  if (cols == null || rows == null) {
    return null;
  }

  return {
    height: rows.size,
    left: cols.offset,
    top: rows.offset,
    width: cols.size,
  };
}

/**
 * Renders the selection and focus regions clipped to a single quadrant's
 * region. Regions that span the frozen and scrollable areas are drawn as
 * abutting rectangles in each quadrant, so the selection overlay stays pinned
 * to the frozen rows/columns as the scrollable area scrolls under them.
 */
export function TableRegionLayer<TData extends BP_RowData>({
  table,
  regionGroups,
  columnRegion,
  rowRegion,
  getRowTop,
  getRowHeight,
}: TableRegionLayerProps<TData>) {
  return (
    <div className={TABLE_OVERLAY_LAYER} aria-hidden>
      {regionGroups.map((group, groupIndex) =>
        group.regions.map((region, regionIndex) => {
          const style = regionToStyle(
            table,
            region,
            columnRegion,
            rowRegion,
            getRowTop,
            getRowHeight,
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
