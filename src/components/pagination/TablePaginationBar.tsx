import classNames from 'classnames';
import { Button, ButtonGroup, HTMLSelect } from '@blueprintjs/core';
import {
  TABLE_PAGINATION_BAR,
  TABLE_PAGINATION_BAR_CONTROLS,
  TABLE_PAGINATION_BAR_TEXT,
} from '../common/classes.ts';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './constants.ts';

export type TablePaginationBarProps = {
  /** Zero-based index of the current page. */
  pageIndex: number;
  /** Number of rows shown per page. */
  pageSize: number;
  /**
   * Total number of pages. `undefined` means the count is unknown — typical for
   * manual/server-side pagination without a `rowCount` — in which case "last"
   * navigation is disabled and "next" stays enabled.
   */
  pageCount?: number;
  /**
   * Total number of rows across all pages, used for the "1–10 of 240" summary.
   * When `undefined`, the summary is omitted.
   */
  rowCount?: number;
  /** Page sizes offered by the rows-per-page select. */
  pageSizeOptions?: readonly number[];
  /** Invoked with the requested page index when a navigation control is used. */
  onPageIndexChange: (pageIndex: number) => void;
  /** Invoked with the requested page size when the rows-per-page select changes. */
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
};

/**
 * Blueprint-styled pagination bar rendered below the table by the
 * `withPagination` HOC. It is presentational: page state and navigation are
 * owned by the caller.
 */
export function TablePaginationBar({
  pageIndex,
  pageSize,
  pageCount,
  rowCount,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageIndexChange,
  onPageSizeChange,
  className,
}: TablePaginationBarProps) {
  const knownPageCount = pageCount != null && pageCount >= 0 ? pageCount : undefined;
  const canPrevious = pageIndex > 0;
  const canNext = knownPageCount === undefined ? true : pageIndex < knownPageCount - 1;

  const firstRowNumber = rowCount === undefined || rowCount === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRowNumber =
    rowCount === undefined ? undefined : Math.min((pageIndex + 1) * pageSize, rowCount);

  // Keep the current page size selectable even when it is not one of the
  // offered options (e.g. it came from controlled state).
  const selectablePageSizes = pageSizeOptions.includes(pageSize)
    ? pageSizeOptions
    : [...pageSizeOptions, pageSize].sort((a, b) => a - b);

  return (
    <div className={classNames(TABLE_PAGINATION_BAR, className)}>
      <div className={TABLE_PAGINATION_BAR_CONTROLS}>
        <span className={TABLE_PAGINATION_BAR_TEXT}>Rows per page:</span>
        <HTMLSelect
          aria-label="Rows per page"
          onChange={(event) => onPageSizeChange(Number(event.currentTarget.value))}
          options={selectablePageSizes}
          value={pageSize}
        />
        {rowCount !== undefined && (
          <span className={TABLE_PAGINATION_BAR_TEXT}>
            {firstRowNumber === 0 ? 0 : `${firstRowNumber}–${lastRowNumber}`} of {rowCount}
          </span>
        )}
      </div>
      <div className={TABLE_PAGINATION_BAR_CONTROLS}>
        <span className={TABLE_PAGINATION_BAR_TEXT}>
          Page {pageIndex + 1}
          {knownPageCount !== undefined ? ` of ${knownPageCount}` : ''}
        </span>
        <ButtonGroup>
          <Button
            aria-label="First page"
            disabled={!canPrevious}
            icon="double-chevron-left"
            onClick={() => onPageIndexChange(0)}
          />
          <Button
            aria-label="Previous page"
            disabled={!canPrevious}
            icon="chevron-left"
            onClick={() => onPageIndexChange(pageIndex - 1)}
          />
          <Button
            aria-label="Next page"
            disabled={!canNext}
            icon="chevron-right"
            onClick={() => onPageIndexChange(pageIndex + 1)}
          />
          <Button
            aria-label="Last page"
            disabled={knownPageCount === undefined || !canNext}
            icon="double-chevron-right"
            onClick={() => {
              if (knownPageCount !== undefined) {
                onPageIndexChange(knownPageCount - 1);
              }
            }}
          />
        </ButtonGroup>
      </div>
    </div>
  );
}
