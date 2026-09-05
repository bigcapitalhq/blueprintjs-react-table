import classNames from 'classnames';
import {
  TABLE_ROW_HEADERS,
  TABLE_ROW_HEADERS_CELLS_CONTAINER,
} from '../common/classes.ts';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { RowRegion } from '../common/pinning.ts';
import { TableRowHeaderCell } from './TableRowHeaderCell.tsx';

export type TableRowHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowRegion: RowRegion;
  rowHeight: number;
  rowHeaderWidth: number;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
};

export function TableRowHeaders<TData extends BP_RowData>({
  table,
  rowRegion,
  rowHeight,
  rowHeaderWidth,
  areRowHeadersLoading,
  rowVirtualizer,
  className,
  ...restProps
}: TableRowHeadersProps<TData>) {
  const rows = rowRegion === 'top' ? table.getTopRows() : table.getCenterRows();
  const totalHeight = rows.length * rowHeight;
  const lastRowIndex = rows.length - 1;
  const isVirtualized = rowRegion === 'center' && rowVirtualizer != null;

  const virtualRows = isVirtualized ? rowVirtualizer?.getVirtualItems() : undefined;
  // Virtual item offsets include the scroll margin (the header area above the
  // body inside the shared scroll container); subtract it to align with the
  // body's coordinate space.
  const scrollMargin = rowVirtualizer?.options.scrollMargin ?? 0;
  const paddingTop =
    virtualRows != null && virtualRows.length > 0 ? virtualRows[0].start - scrollMargin : 0;
  const paddingBottom =
    virtualRows != null && virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1].end - scrollMargin)
      : 0;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_ROW_HEADERS, className)}
      style={{ width: rowHeaderWidth }}
    >
      <div style={{ height: totalHeight }}>
        <div
          className={TABLE_ROW_HEADERS_CELLS_CONTAINER}
          style={{
            height: totalHeight,
            transform: 'translateY(0px)',
            paddingTop,
            paddingBottom,
          }}
        >
          {(virtualRows != null
            ? virtualRows.map((virtualRow) => ({ index: virtualRow.index }))
            : rows.map((_, rowIndex) => ({ index: rowIndex }))
          ).map(({ index }) => (
            <TableRowHeaderCell
              key={rows[index]?.id ?? index}
              rowIndex={index}
              rowHeight={rowHeight}
              loading={areRowHeadersLoading}
              isLastInColumn={index === lastRowIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}