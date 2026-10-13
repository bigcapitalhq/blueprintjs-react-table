import classNames from 'classnames';
import { TABLE_COLUMN_HEADERS } from '../common/classes.ts';
import { getRegionWidth, type ColumnRegion } from '../common/pinning.ts';
import { getGhostedTableWidth, type BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableHead } from './TableHead.tsx';

export type TableColumnHeadersProps<TData extends BP_RowData> = HTMLPropsRef<HTMLDivElement> & {
  table: BP_TableInstance<TData>;
  /** Which column region this header renders: frozen ("start") or scrollable ("center"). */
  columnRegion: ColumnRegion;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
  ghosts?: BP_GhostCells;
};

export function TableColumnHeaders<TData extends BP_RowData>({
  table,
  columnRegion,
  enableSorting = false,
  areColumnHeadersLoading,
  ghosts,
  className,
  ...restProps
}: TableColumnHeadersProps<TData>) {
  const headerGroups =
    columnRegion === 'start' ? table.getStartHeaderGroups() : table.getCenterHeaderGroups();
  // Ghost columns fill leftover viewport space to the right of every data
  // column, so they only live in the scrollable ("center") region.
  const regionGhosts = columnRegion === 'center' ? ghosts : undefined;
  const totalWidth = getGhostedTableWidth(getRegionWidth(table, columnRegion), regionGhosts);

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
            ghosts={regionGhosts}
          />
        ))}
      </div>
    </div>
  );
}
