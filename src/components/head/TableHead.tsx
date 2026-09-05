import classNames from 'classnames';
import { type HeaderGroup } from '@tanstack/react-table';
import { TABLE_COLUMN_HEADER_TR, TABLE_THEAD } from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';
import type { ColumnRegion } from '../common/pinning.ts';
import { TableHeadCell } from './TableHeadCell.tsx';

export type TableHeadProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  headerGroup: HeaderGroup<BP_TableFeatures, TData>;
  columnRegion: ColumnRegion;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
};

export function TableHead<TData extends BP_RowData>({
  table,
  headerGroup,
  columnRegion,
  enableSorting = false,
  areColumnHeadersLoading,
}: TableHeadProps<TData>) {
  const totalWidth =
    columnRegion === 'start' ? table.getStartTotalSize() : table.getCenterTotalSize();
  const lastHeaderId = headerGroup.headers[headerGroup.headers.length - 1]?.id;

  return (
    <div
      className={classNames(TABLE_THEAD, TABLE_COLUMN_HEADER_TR)}
      style={{ transform: 'translateX(0px)', width: totalWidth }}
    >
      {headerGroup.headers.map((header) => (
        <TableHeadCell
          key={header.id}
          table={table}
          header={header}
          columnRegion={columnRegion}
          isLastInRow={header.id === lastHeaderId}
          enableSorting={enableSorting}
          loading={areColumnHeadersLoading}
        />
      ))}
    </div>
  );
}