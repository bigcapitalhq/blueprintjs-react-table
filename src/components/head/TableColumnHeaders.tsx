import classNames from 'classnames';
import { TABLE_COLUMN_HEADERS } from '../common/classes.ts';
import { getGhostedTableWidth, type BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { useTableColumnReorder } from './table-column-reorder-context.ts';
import { TableHead } from './TableHead.tsx';

export type TableColumnHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
  ghosts?: BP_GhostCells;
};

export function TableColumnHeaders<TData extends BP_RowData>({
  table,
  enableSorting = false,
  areColumnHeadersLoading,
  ghosts,
  className,
  ...restProps
}: TableColumnHeadersProps<TData>) {
  const totalWidth = getGhostedTableWidth(table.getTotalSize(), ghosts);
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
            enableSorting={enableSorting}
            areColumnHeadersLoading={areColumnHeadersLoading}
            ghosts={ghosts}
          />
        ))}
      </div>
    </div>
  );
}
