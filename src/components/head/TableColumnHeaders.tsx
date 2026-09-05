import classNames from 'classnames';
import { TABLE_COLUMN_HEADERS } from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import type { ColumnRegion } from '../common/pinning.ts';
import { TableHead } from './TableHead.tsx';

export type TableColumnHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  columnRegion: ColumnRegion;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
};

export function TableColumnHeaders<TData extends BP_RowData>({
  table,
  columnRegion,
  enableSorting = false,
  areColumnHeadersLoading,
  className,
  ...restProps
}: TableColumnHeadersProps<TData>) {
  const headerGroups =
    columnRegion === 'start' ? table.getStartHeaderGroups() : table.getCenterHeaderGroups();
  const totalWidth =
    columnRegion === 'start' ? table.getStartTotalSize() : table.getCenterTotalSize();

  return (
    <div {...restProps} className={classNames(TABLE_COLUMN_HEADERS, className)}>
      <div style={{ width: totalWidth }}>
        {headerGroups.map((headerGroup) => (
          <TableHead
            key={headerGroup.id}
            table={table}
            headerGroup={headerGroup}
            columnRegion={columnRegion}
            enableSorting={enableSorting}
            areColumnHeadersLoading={areColumnHeadersLoading}
          />
        ))}
      </div>
    </div>
  );
}