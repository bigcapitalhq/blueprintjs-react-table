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

export type TableRegionLayerProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  regionGroups: StyledRegionGroup[];
  getRowTop: (index: number) => number;
  getRowHeight: (index: number) => number;
  totalHeight: number;
};

function cumulativeColumnWidth(
  columns: Array<{ getSize: () => number }>,
  startIndex: number,
  endIndex: number,
): number {
  let width = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    width += columns[i]?.getSize() ?? 0;
  }
  return width;
}

function cumulativeRowHeight(
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
  startIndex: number,
  endIndex: number,
): number {
  return getRowTop(endIndex) + getRowHeight(endIndex) - getRowTop(startIndex);
}

function regionToStyle<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  region: Region,
  getRowTop: (index: number) => number,
  getRowHeight: (index: number) => number,
  totalWidth: number,
  totalHeight: number,
): CSSProperties {
  const cardinality = Regions.getRegionCardinality(region);
  const columns = table.getVisibleLeafColumns();

  switch (cardinality) {
    case RegionCardinality.CELLS: {
      const rowStart = region.rows![0];
      const rowEnd = region.rows![1];
      const colStart = region.cols![0];
      const colEnd = region.cols![1];
      return {
        height: cumulativeRowHeight(getRowTop, getRowHeight, rowStart, rowEnd),
        left: columns[colStart]?.getStart() ?? 0,
        top: getRowTop(rowStart),
        width: cumulativeColumnWidth(columns, colStart, colEnd),
      };
    }
    case RegionCardinality.FULL_COLUMNS: {
      const colStart = region.cols![0];
      const colEnd = region.cols![1];
      return {
        height: totalHeight,
        left: columns[colStart]?.getStart() ?? 0,
        top: 0,
        width: cumulativeColumnWidth(columns, colStart, colEnd),
      };
    }
    case RegionCardinality.FULL_ROWS: {
      const rowStart = region.rows![0];
      const rowEnd = region.rows![1];
      return {
        height: cumulativeRowHeight(getRowTop, getRowHeight, rowStart, rowEnd),
        left: 0,
        top: getRowTop(rowStart),
        width: totalWidth,
      };
    }
    default:
      return { height: totalHeight, left: 0, top: 0, width: totalWidth };
  }
}

export function TableRegionLayer<TData extends BP_RowData>({
  table,
  regionGroups,
  getRowTop,
  getRowHeight,
  totalHeight,
}: TableRegionLayerProps<TData>) {
  const totalWidth = table.getTotalSize();

  return (
    <div className={TABLE_OVERLAY_LAYER} aria-hidden>
      {regionGroups.map((group, groupIndex) =>
        group.regions.map((region, regionIndex) => (
          <div
            key={`${groupIndex}-${regionIndex}`}
            className={classNames(TABLE_OVERLAY, TABLE_REGION, group.className)}
            style={regionToStyle(table, region, getRowTop, getRowHeight, totalWidth, totalHeight)}
          />
        )),
      )}
    </div>
  );
}
