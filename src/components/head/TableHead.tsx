import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { type HeaderGroup } from '@tanstack/react-table';
import { LoadableContent } from '../common/LoadableContent.tsx';
import {
  TABLE_COLUMN_HEADER_CELL,
  TABLE_COLUMN_HEADER_TR,
  TABLE_COLUMN_NAME,
  TABLE_COLUMN_NAME_TEXT,
  TABLE_HEADER,
  TABLE_HEADER_CONTENT,
  TABLE_THEAD,
} from '../common/classes.ts';
import { getRegionWidth, type ColumnRegion } from '../common/pinning.ts';
import { getGhostedTableWidth, type BP_GhostCells } from '../../hooks/use-ghost-cells.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';
import { TableHeadCell } from './TableHeadCell.tsx';

export type TableHeadProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  headerGroup: HeaderGroup<BP_TableFeatures, TData>;
  columnRegion: ColumnRegion;
  enableSorting?: boolean;
  areColumnHeadersLoading: boolean;
  ghosts?: BP_GhostCells;
};

export function TableHead<TData extends BP_RowData>({
  table,
  headerGroup,
  columnRegion,
  enableSorting = false,
  areColumnHeadersLoading,
  ghosts,
}: TableHeadProps<TData>) {
  // TanStack builds the region's header groups from visible leaf columns, so
  // `headers` (and each header's column index) already exclude hidden and
  // other-region columns.
  const lastHeaderId = headerGroup.headers[headerGroup.headers.length - 1]?.id;
  const width = getGhostedTableWidth(getRegionWidth(table, columnRegion), ghosts);

  return (
    <div
      className={classNames(TABLE_THEAD, TABLE_COLUMN_HEADER_TR)}
      style={{ transform: 'translateX(0px)', width }}
    >
      {headerGroup.headers.map((header) => (
        <TableHeadCell
          key={header.id}
          table={table}
          header={header}
          isLastInRow={header.id === lastHeaderId}
          enableSorting={enableSorting}
          loading={areColumnHeadersLoading}
        />
      ))}
      {ghosts != null &&
        Array.from({ length: ghosts.columnCount }).map((_, ghostColumnOffset) => (
          <div
            key={`ghost-column-header-${ghostColumnOffset}`}
            className={classNames(TABLE_HEADER, TABLE_COLUMN_HEADER_CELL, {
              [Classes.LOADING]: areColumnHeadersLoading,
            })}
            style={{ flexBasis: ghosts.columnWidth, minWidth: 0, width: ghosts.columnWidth }}
          >
            <div className={TABLE_COLUMN_NAME}>
              <div className={TABLE_COLUMN_NAME_TEXT}>
                <LoadableContent loading={areColumnHeadersLoading} variableLength />
              </div>
            </div>
            <div className={TABLE_HEADER_CONTENT} />
          </div>
        ))}
    </div>
  );
}
