import classNames from 'classnames';
import { TABLE_COLUMN_HEADERS } from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { useTableColumnReorder } from './table-column-reorder-context.ts';
import { TableHead } from './TableHead.tsx';

export type TableColumnHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  areColumnHeadersLoading: boolean;
};

export function TableColumnHeaders<TData extends BP_RowData>({
  table,
  areColumnHeadersLoading,
  className,
  ...restProps
}: TableColumnHeadersProps<TData>) {
  const totalWidth = table.getTotalSize();
  const reorder = useTableColumnReorder();

  return (
    <div
      {...restProps}
      ref={reorder?.columnsRef ?? undefined}
      className={classNames(TABLE_COLUMN_HEADERS, className)}
    >
      <div style={{ width: totalWidth }}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableHead
            key={headerGroup.id}
            table={table}
            headerGroup={headerGroup}
            areColumnHeadersLoading={areColumnHeadersLoading}
          />
        ))}
      </div>
    </div>
  );
}
