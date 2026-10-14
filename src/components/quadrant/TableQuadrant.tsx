import classNames from 'classnames';
import type {
  CSSProperties,
  MutableRefObject,
  ReactNode,
  UIEventHandler,
  WheelEventHandler,
} from 'react';
import {
  TABLE_BOTTOM_CONTAINER,
  TABLE_QUADRANT,
  TABLE_QUADRANT_LEFT,
  TABLE_QUADRANT_MAIN,
  TABLE_QUADRANT_SCROLL_CONTAINER,
  TABLE_QUADRANT_TOP,
  TABLE_QUADRANT_TOP_LEFT,
  TABLE_TOP_CONTAINER,
} from '../common/classes.ts';
import {
  getFrozenColumnsWidth,
  getFrozenRowsHeight,
  type ColumnRegion,
  type RowRegion,
} from '../common/pinning.ts';
import { useTableSelection } from '../common/table-selection-context.ts';
import type { BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type { RowResizingApi } from '../../hooks/use-row-resizing.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';
import { TableBody } from '../body/TableBody.tsx';
import { TableRowHeaders } from '../body/TableRowHeaders.tsx';
import { TableColumnHeaders } from '../head/TableColumnHeaders.tsx';
import { TableMenu } from '../head/TableMenu.tsx';
import { TableRowSelectionHeaderCell } from '../head/TableRowSelectionHeaderCell.tsx';
import { QuadrantType } from './quadrant-type.ts';

export type TableQuadrantProps<TData extends BP_RowData> = {
  quadrantType: QuadrantType;
  table: BP_TableInstance<TData>;
  rowHeaderWidth: number;
  /** Whether to render the row headers (the row-number column) and corner menu. */
  enableRowHeader?: boolean;
  /** Effective (measured) height of the column-header area. */
  columnHeaderHeight: number;
  /** Ref used to measure the rendered column-header height (TOP quadrant only). */
  columnHeaderMeasureRef?: MutableRefObject<HTMLDivElement | null>;
  enableSorting?: boolean;
  areCellsLoading: boolean;
  areColumnHeadersLoading: boolean;
  areRowHeadersLoading: boolean;
  rowResizing: RowResizingApi;
  rowVirtualizer?: BP_RowVirtualizer;
  ghosts?: BP_GhostCells;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  /** Only provided for the main quadrant, whose scrollbar is visible. */
  onScroll?: UIEventHandler<HTMLDivElement>;
  /** Provided for every non-main quadrant; forwards wheel gestures to the main quadrant. */
  onWheel?: WheelEventHandler<HTMLDivElement>;
  style?: CSSProperties;
  /** Width of the row-selection checkboxes column; `0` hides the column. */
  selectionColumnWidth?: number;
};

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

/**
 * One quadrant of the table. The quadrant type determines which regions it
 * renders:
 *
 * - `MAIN` renders the scrollable ("center") columns and rows. It is the only
 *   quadrant with visible scrollbars and the only one that handles keyboard
 *   focus; the other quadrants sync their scroll offsets from it.
 * - `TOP` renders the column headers and the frozen ("top") rows.
 * - `LEFT` renders the row headers and the frozen ("start") columns.
 * - `TOP_LEFT` renders the corner menu, the frozen column headers, the frozen
 *   row headers, and the cells frozen in both directions.
 *
 * Each quadrant's content is padded with spacers so the quadrants that scroll
 * share the main quadrant's scroll ranges.
 */
export function TableQuadrant<TData extends BP_RowData>({
  quadrantType,
  table,
  rowHeaderWidth,
  enableRowHeader = true,
  columnHeaderHeight,
  columnHeaderMeasureRef,
  enableSorting = false,
  areCellsLoading,
  areColumnHeadersLoading,
  areRowHeadersLoading,
  rowResizing,
  rowVirtualizer,
  ghosts,
  scrollContainerRef,
  onScroll,
  onWheel,
  style,
  selectionColumnWidth = 0,
}: TableQuadrantProps<TData>) {
  const isMain = quadrantType === QuadrantType.MAIN;
  const isTopQuadrant =
    quadrantType === QuadrantType.TOP || quadrantType === QuadrantType.TOP_LEFT;
  const isLeftQuadrant =
    quadrantType === QuadrantType.LEFT || quadrantType === QuadrantType.TOP_LEFT;
  const columnRegion: ColumnRegion = isLeftQuadrant ? 'start' : 'center';
  const rowRegion: RowRegion = isTopQuadrant ? 'top' : 'center';
  const showsColumnHeaders =
    quadrantType === QuadrantType.TOP || quadrantType === QuadrantType.TOP_LEFT;
  const showsMenu = quadrantType === QuadrantType.TOP_LEFT;

  const selection = useTableSelection();
  const frozenColumnsWidth = getFrozenColumnsWidth(table);
  const frozenRowsHeight = getFrozenRowsHeight(table, rowResizing.getRowHeight);
  // The row-number column collapses when the row headers are disabled; the
  // selection column (when enabled) still occupies the frozen chrome.
  const rowNumberColumnWidth = enableRowHeader ? rowHeaderWidth : 0;

  const renderBody = (offsetTop: number, offsetLeft: number) => (
    <TableBody
      table={table}
      columnRegion={columnRegion}
      rowRegion={rowRegion}
      offsetTop={offsetTop}
      offsetLeft={offsetLeft}
      areCellsLoading={areCellsLoading}
      rowVirtualizer={rowVirtualizer}
      rowResizing={rowResizing}
      ghosts={ghosts}
    />
  );

  const columnHeaderArea = showsColumnHeaders ? (
    <div
      ref={quadrantType === QuadrantType.TOP ? columnHeaderMeasureRef : undefined}
      className={TABLE_TOP_CONTAINER}
      // The scrollable region of the TOP quadrant starts after the frozen
      // columns, which are covered by the TOP_LEFT quadrant.
      style={columnRegion === 'center' ? { paddingLeft: frozenColumnsWidth } : undefined}
    >
      {showsMenu && (
        <>
          {enableRowHeader && (
            <TableMenu width={rowHeaderWidth} height={columnHeaderHeight} />
          )}
          {selectionColumnWidth > 0 && (
            <TableRowSelectionHeaderCell
              table={table}
              width={selectionColumnWidth}
              height={columnHeaderHeight}
              loading={areRowHeadersLoading}
            />
          )}
        </>
      )}
      <TableColumnHeaders
        table={table}
        columnRegion={columnRegion}
        enableSorting={enableSorting}
        areColumnHeadersLoading={areColumnHeadersLoading}
        ghosts={ghosts}
      />
    </div>
  ) : undefined;

  let content: ReactNode;
  switch (quadrantType) {
    case QuadrantType.MAIN:
      // The main quadrant fills the whole table; its content is offset so the
      // frozen rows/columns and the headers (rendered by the other quadrants)
      // align with it without scrolling.
      content = renderBody(
        columnHeaderHeight + frozenRowsHeight,
        rowNumberColumnWidth + selectionColumnWidth + frozenColumnsWidth,
      );
      break;
    case QuadrantType.TOP:
      content = (
        <>
          {columnHeaderArea}
          {/* Frozen rows of the scrollable columns; the frozen columns are covered by TOP_LEFT. */}
          {renderBody(0, frozenColumnsWidth)}
        </>
      );
      break;
    case QuadrantType.LEFT:
      content = (
        // The frozen rows' band at the top is covered by the TOP_LEFT quadrant.
        <div style={{ paddingTop: frozenRowsHeight }}>
          <div
            className={TABLE_BOTTOM_CONTAINER}
            style={{ width: rowNumberColumnWidth + selectionColumnWidth + frozenColumnsWidth }}
          >
            <TableRowHeaders
              table={table}
              rowRegion="center"
              rowHeaderWidth={rowHeaderWidth}
              enableRowHeader={enableRowHeader}
              selectionColumnWidth={selectionColumnWidth}
              areRowHeadersLoading={areRowHeadersLoading}
              rowVirtualizer={rowVirtualizer}
              rowResizing={rowResizing}
              ghosts={ghosts}
            />
            {renderBody(0, 0)}
          </div>
        </div>
      );
      break;
    case QuadrantType.TOP_LEFT:
      content = (
        <>
          {columnHeaderArea}
          <div
            className={TABLE_BOTTOM_CONTAINER}
            style={{ width: rowNumberColumnWidth + selectionColumnWidth + frozenColumnsWidth }}
          >
            <TableRowHeaders
              table={table}
              rowRegion="top"
              rowHeaderWidth={rowHeaderWidth}
              enableRowHeader={enableRowHeader}
              selectionColumnWidth={selectionColumnWidth}
              areRowHeadersLoading={areRowHeadersLoading}
              rowVirtualizer={rowVirtualizer}
              rowResizing={rowResizing}
              ghosts={ghosts}
            />
            {renderBody(0, 0)}
          </div>
        </>
      );
      break;
    default:
      content = undefined;
  }

  return (
    <div className={classNames(TABLE_QUADRANT, quadrantCssClass(quadrantType))} style={style}>
      <div
        ref={scrollContainerRef}
        className={TABLE_QUADRANT_SCROLL_CONTAINER}
        tabIndex={isMain && selection != null ? 0 : undefined}
        onKeyDown={isMain ? selection?.handleKeyDown : undefined}
        onScroll={onScroll}
        onWheel={onWheel}
      >
        {content}
      </div>
    </div>
  );
}
