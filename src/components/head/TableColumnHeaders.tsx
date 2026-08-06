import classNames from 'classnames';
import { TABLE_COLUMN_HEADERS } from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableHead } from './TableHead.tsx';

export type TableColumnHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
};

export function TableColumnHeaders<TData extends BP_RowData>({
  table,
  className,
  ...restProps
}: TableColumnHeadersProps<TData>) {
  const totalWidth = table.getTotalSize();

  return (
    <div {...restProps} className={classNames(TABLE_COLUMN_HEADERS, className)}>
      <div style={{ width: totalWidth }}>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableHead key={headerGroup.id} table={table} headerGroup={headerGroup} />
        ))}
      </div>
    </div>
  );
}
