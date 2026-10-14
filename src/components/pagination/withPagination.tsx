import {
  createPaginatedRowModel,
  functionalUpdate,
  rowPaginationFeature,
  tableFeatures,
  type PaginationState,
  type Updater,
} from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { DEFAULT_BP_TABLE_FEATURES } from '../../hooks/use-bp-table-instance.ts';
import type { BP_RowData } from '../../types.ts';
import type { BP_TableProps } from '../BP_Table.tsx';
import { TABLE_PAGINATION_LAYOUT } from '../common/classes.ts';
import { DEFAULT_PAGE_SIZE } from './constants.ts';
import { TablePaginationBar } from './TablePaginationBar.tsx';

export type BP_PaginationOptions = {
  /**
   * Initial page size for uncontrolled pagination. Ignored when
   * `state.pagination` or `initialState.pagination` is provided.
   *
   * @default 10
   */
  initialPageSize?: number;
  /**
   * Initial zero-based page index for uncontrolled pagination. Ignored when
   * `state.pagination` or `initialState.pagination` is provided.
   *
   * @default 0
   */
  initialPageIndex?: number;
  /** Page sizes offered by the pagination bar's rows-per-page select. */
  pageSizeOptions?: readonly number[];
  /**
   * Whether to render the pagination bar below the table. When `false`, the
   * table is still paginated; only the controls are hidden.
   *
   * @default true
   */
  showPaginationBar?: boolean;
  /** Additional class name(s) for the pagination bar. */
  paginationBarClassName?: string;
};

export type BP_PaginatedTableProps<TData extends BP_RowData> = BP_TableProps<TData> &
  BP_PaginationOptions;

/**
 * The default `BP_Table` features extended with TanStack's row pagination.
 * Composed once at module scope: the feature registry is static, and the
 * paginated row model is chained after sorting, so pages contain sorted rows.
 */
const PAGINATED_BP_TABLE_FEATURES = tableFeatures({
  ...DEFAULT_BP_TABLE_FEATURES,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

/**
 * Wraps a table component (usually `BP_Table`) with row pagination and a
 * Blueprint-styled pagination bar, keeping the whole pagination concern — the
 * TanStack feature registration, the page state, and the controls — outside the
 * wrapped component.
 *
 * Pagination is uncontrolled by default (`initialPageIndex` /
 * `initialPageSize`, or `initialState.pagination`). It becomes controlled when
 * `state.pagination` is provided: the HOC defers to it and forwards
 * `onPaginationChange`.
 *
 * Client-side pagination slices `data` automatically. For server-side
 * pagination, pass `manualPagination` plus `pageCount` (or `rowCount`) and
 * provide the current page's rows as `data`.
 *
 * @example
 * const PaginatedTable = withPagination(BP_Table);
 * <PaginatedTable data={rows} columns={columns} initialPageSize={20} />
 */
export function withPagination<TData extends BP_RowData>(
  TableComponent: ComponentType<BP_TableProps<TData>>,
): ComponentType<BP_PaginatedTableProps<TData>> {
  function BP_PaginatedTable({
    data,
    initialState,
    state,
    features,
    onPaginationChange,
    manualPagination,
    pageCount: pageCountOption,
    rowCount: rowCountOption,
    initialPageIndex = 0,
    initialPageSize = DEFAULT_PAGE_SIZE,
    pageSizeOptions,
    showPaginationBar = true,
    paginationBarClassName,
    ...tableProps
  }: BP_PaginatedTableProps<TData>) {
    const [uncontrolledPagination, setUncontrolledPagination] = useState<PaginationState>(() => ({
      pageIndex: initialState?.pagination?.pageIndex ?? initialPageIndex,
      pageSize: initialState?.pagination?.pageSize ?? initialPageSize,
    }));

    const controlledPagination = state?.pagination;
    const pagination = controlledPagination ?? uncontrolledPagination;
    const { pageIndex, pageSize } = pagination;

    const handlePaginationChange = useCallback(
      (updater: Updater<PaginationState>) => {
        onPaginationChange?.(updater);
        if (controlledPagination === undefined) {
          setUncontrolledPagination((previous) => functionalUpdate(updater, previous));
        }
      },
      [controlledPagination, onPaginationChange],
    );

    const isManualPagination = manualPagination === true;
    const totalRowCount = isManualPagination ? rowCountOption : data.length;

    const knownPageCount = useMemo(() => {
      if (isManualPagination) {
        if (pageCountOption != null && pageCountOption >= 0) {
          return pageCountOption;
        }
        if (rowCountOption != null) {
          return Math.ceil(rowCountOption / pageSize);
        }
        return undefined;
      }
      return Math.max(1, Math.ceil(data.length / pageSize));
    }, [data.length, isManualPagination, pageCountOption, pageSize, rowCountOption]);

    // Keep the page index in range when the page count shrinks (fewer rows, a
    // larger page size, or a smaller manual page count). TanStack's automatic
    // page index reset covers data changes; this covers everything else.
    useEffect(() => {
      if (knownPageCount === undefined) {
        return;
      }
      const lastPageIndex = Math.max(0, knownPageCount - 1);
      if (pageIndex > lastPageIndex) {
        handlePaginationChange((previous) => ({ ...previous, pageIndex: lastPageIndex }));
      }
    }, [handlePaginationChange, knownPageCount, pageIndex]);

    // Feature registries are static, so the default one is shared; a caller
    // supplied registry is merged with the defaults plus pagination.
    const resolvedFeatures = useMemo(
      () =>
        features == null
          ? PAGINATED_BP_TABLE_FEATURES
          : tableFeatures({
              ...DEFAULT_BP_TABLE_FEATURES,
              ...features,
              rowPaginationFeature,
              paginatedRowModel: createPaginatedRowModel(),
            }),
      [features],
    );

    const handlePageIndexChange = useCallback(
      (nextPageIndex: number) => {
        handlePaginationChange((previous) => ({
          ...previous,
          pageIndex: Math.max(0, nextPageIndex),
        }));
      },
      [handlePaginationChange],
    );

    const handlePageSizeChange = useCallback(
      (nextPageSize: number) => {
        // Resetting to the first page keeps navigation predictable when the
        // page size changes.
        handlePaginationChange((previous) => ({
          ...previous,
          pageIndex: 0,
          pageSize: nextPageSize,
        }));
      },
      [handlePaginationChange],
    );

    return (
      <div className={TABLE_PAGINATION_LAYOUT}>
        <TableComponent
          {...tableProps}
          data={data}
          initialState={initialState}
          state={{ ...state, pagination }}
          features={resolvedFeatures}
          onPaginationChange={handlePaginationChange}
          manualPagination={manualPagination}
          pageCount={pageCountOption}
          rowCount={rowCountOption}
        />
        {showPaginationBar && (
          <TablePaginationBar
            className={paginationBarClassName}
            onPageIndexChange={handlePageIndexChange}
            onPageSizeChange={handlePageSizeChange}
            pageCount={knownPageCount}
            pageIndex={pageIndex}
            pageSize={pageSize}
            pageSizeOptions={pageSizeOptions}
            rowCount={totalRowCount}
          />
        )}
      </div>
    );
  }

  const componentName = TableComponent.displayName ?? TableComponent.name ?? 'Table';
  BP_PaginatedTable.displayName = `withPagination(${componentName})`;
  return BP_PaginatedTable;
}
