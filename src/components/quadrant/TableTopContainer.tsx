import classNames from 'classnames';
import { TABLE_TOP_CONTAINER } from '../common/classes.ts';
import { TableMenu } from '../head/TableMenu.tsx';
import { TableColumnHeaders } from '../head/TableColumnHeaders.tsx';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { ColumnRegion } from '../common/pinning.ts';

export type TableTopContainerProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  columnRegion: ColumnRegion;
  rowHeaderWidth: number;
  columnHeaderHeight: number;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
};

export function TableTopContainer<TData extends BP_RowData>({
  table,
  columnRegion,
  rowHeaderWidth,
  columnHeaderHeight,
  enableSorting = false,
  areColumnHeadersLoading,
  className,
  ...restProps
}: TableTopContainerProps<TData>) {
  return (
    <div {...restProps} className={classNames(TABLE_TOP_CONTAINER, className)}>
      <TableMenu width={rowHeaderWidth} height={columnHeaderHeight} />
      <TableColumnHeaders
        table={table}
        columnRegion={columnRegion}
        enableSorting={enableSorting}
        areColumnHeadersLoading={areColumnHeadersLoading}
      />
    </div>
  );
}