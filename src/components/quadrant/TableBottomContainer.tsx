import classNames from 'classnames';
import { TABLE_BOTTOM_CONTAINER } from '../common/classes.ts';
import { TableRowHeaders } from '../body/TableRowHeaders.tsx';
import { TableBody } from '../body/TableBody.tsx';
import type { BP_RowVirtualizer } from '../../hooks/use-row-virtualizer.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { ColumnRegion, RowRegion } from '../common/pinning.ts';

export type TableBottomContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  rowRegion: RowRegion;
  columnRegion: ColumnRegion;
  rowHeight: number;
  rowHeaderWidth: number;
  areCellsLoading: boolean;
  areRowHeadersLoading: boolean;
  rowVirtualizer?: BP_RowVirtualizer;
};

export function TableBottomContainer<TData extends BP_RowData>({
  table,
  rowRegion,
  columnRegion,
  rowHeight,
  rowHeaderWidth,
  areCellsLoading,
  areRowHeadersLoading,
  rowVirtualizer,
  className,
  ...restProps
}: TableBottomContainerProps<TData>) {
  const rows = rowRegion === 'top' ? table.getTopRows() : table.getCenterRows();
  const bodyWidth =
    columnRegion === 'start' ? table.getStartTotalSize() : table.getCenterTotalSize();
  const bodyHeight = rows.length * rowHeight;

  return (
    <div
      {...restProps}
      className={classNames(TABLE_BOTTOM_CONTAINER, className)}
      style={{ height: bodyHeight, width: rowHeaderWidth + bodyWidth }}
    >
      <TableRowHeaders
        table={table}
        rowRegion={rowRegion}
        rowHeight={rowHeight}
        rowHeaderWidth={rowHeaderWidth}
        areRowHeadersLoading={areRowHeadersLoading}
        rowVirtualizer={rowVirtualizer}
      />
      <TableBody
        table={table}
        rowRegion={rowRegion}
        columnRegion={columnRegion}
        rowHeight={rowHeight}
        areCellsLoading={areCellsLoading}
        rowVirtualizer={rowVirtualizer}
      />
    </div>
  );
}