import classNames from 'classnames';
import type { CSSProperties, MutableRefObject, UIEvent, WheelEvent } from 'react';
import {
  TABLE_QUADRANT,
  TABLE_QUADRANT_LEFT,
  TABLE_QUADRANT_MAIN,
  TABLE_QUADRANT_SCROLL_CONTAINER,
  TABLE_QUADRANT_TOP,
  TABLE_QUADRANT_TOP_LEFT,
} from '../common/classes.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { CellFocusSelectionApi } from '../../hooks/use-cell-focus-selection.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import type { ColumnRegion, RowRegion } from '../common/pinning.ts';
import { getFrozenColumnsWidth } from '../common/pinning.ts';
import { TableTopContainer } from './TableTopContainer.tsx';
import { TableBottomContainer } from './TableBottomContainer.tsx';
import { TableResizeGuides } from '../layers/TableResizeGuides.tsx';
import { TableReorderGuides } from '../layers/TableReorderGuides.tsx';
import { QuadrantType } from './quadrant-type.ts';

export type TableQuadrantProps<TData extends BP_RowData> = {
  quadrantType: QuadrantType;
  table: BP_TableInstance<TData>;
  rowHeight: number;
  rowHeaderWidth: number;
  columnHeaderHeight: number;
  enableSorting?: boolean;
  areCellsLoading: boolean;
  areColumnHeadersLoading: boolean;
  areRowHeadersLoading: boolean;
  selection: CellFocusSelectionApi;
  rowVirtualizer?: BP_RowVirtualizer;
  reorderingColumnId: string | null;
  guideIndex: number | null;
  onScroll?: (event: UIEvent<HTMLDivElement>) => void;
  onWheel?: (event: WheelEvent<HTMLDivElement>) => void;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  style?: CSSProperties;
};

function quadrantColumnRegion(quadrantType: QuadrantType): ColumnRegion {
  return quadrantType === QuadrantType.LEFT || quadrantType === QuadrantType.TOP_LEFT
    ? 'start'
    : 'center';
}

function quadrantRowRegion(quadrantType: QuadrantType): RowRegion {
  return quadrantType === QuadrantType.TOP || quadrantType === QuadrantType.TOP_LEFT
    ? 'top'
    : 'center';
}

function quadrantCssClass(quadrantType: QuadrantType) {
  switch (quadrantType) {
    case QuadrantType.MAIN:
      return TABLE_QUADRANT_MAIN;
    case QuadrantType.TOP:
      return TABLE_QUADRANT_TOP;
    case QuadrantType.LEFT:
      return TABLE_QUADRANT_LEFT;
    case QuadrantType.TOP_LEFT:
      return TABLE_QUADRANT_TOP_LEFT;
    default:
      return undefined;
  }
}

export function TableQuadrant<TData extends BP_RowData>({
  quadrantType,
  table,
  rowHeight,
  rowHeaderWidth,
  columnHeaderHeight,
  enableSorting = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
  selection,
  rowVirtualizer,
  reorderingColumnId,
  guideIndex,
  onScroll,
  onWheel,
  scrollContainerRef,
  style,
}: TableQuadrantProps<TData>) {
  const columnRegion = quadrantColumnRegion(quadrantType);
  const rowRegion = quadrantRowRegion(quadrantType);
  const offsetLeft = columnRegion === 'start' ? 0 : getFrozenColumnsWidth(table);

  return (
    <div className={classNames(TABLE_QUADRANT, quadrantCssClass(quadrantType))} style={style}>
      <div
        ref={scrollContainerRef}
        className={TABLE_QUADRANT_SCROLL_CONTAINER}
        tabIndex={quadrantType === QuadrantType.MAIN && selection ? 0 : undefined}
        onScroll={onScroll}
        onWheel={onWheel}
        onKeyDown={quadrantType === QuadrantType.MAIN ? selection?.handleKeyDown : undefined}
      >
        <TableTopContainer
          table={table}
          columnRegion={columnRegion}
          rowHeaderWidth={rowHeaderWidth}
          columnHeaderHeight={columnHeaderHeight}
          enableSorting={enableSorting}
          areColumnHeadersLoading={areColumnHeadersLoading}
        />
        <TableBottomContainer
          table={table}
          rowRegion={rowRegion}
          columnRegion={columnRegion}
          rowHeight={rowHeight}
          rowHeaderWidth={rowHeaderWidth}
          areCellsLoading={areCellsLoading}
          areRowHeadersLoading={areRowHeadersLoading}
          rowVirtualizer={rowVirtualizer}
        />
        <TableResizeGuides
          table={table}
          columnRegion={columnRegion}
          offsetLeft={offsetLeft}
          rowHeaderWidth={rowHeaderWidth}
        />
        <TableReorderGuides
          table={table}
          reorderingColumnId={reorderingColumnId}
          guideIndex={guideIndex}
          columnRegion={columnRegion}
          offsetLeft={offsetLeft}
          rowHeaderWidth={rowHeaderWidth}
        />
      </div>
    </div>
  );
}