import classNames from 'classnames';
import { Checkbox } from '@blueprintjs/core';
import {
  TABLE_COLUMN_HEADER_CELL,
  TABLE_HEADER,
  TABLE_ROW_SELECTION_CHECKBOX,
  TABLE_ROW_SELECTION_HEADER_CELL,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../../types.ts';

export type TableRowSelectionHeaderCellProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  width: number;
  height: number;
  /** Whether the row headers are currently showing loading placeholders. */
  loading?: boolean;
};

/**
 * The header of the row-selection checkboxes column: a select-all checkbox
 * with an indeterminate state, sitting to the right of the corner menu.
 */
export function TableRowSelectionHeaderCell<TData extends BP_RowData>({
  table,
  width,
  height,
  loading = false,
}: TableRowSelectionHeaderCellProps<TData>) {
  const allRowsSelected = table.getIsAllRowsSelected();
  const someRowsSelected = table.getIsSomeRowsSelected();
  return (
    <div
      className={classNames(
        TABLE_HEADER,
        TABLE_COLUMN_HEADER_CELL,
        TABLE_ROW_SELECTION_HEADER_CELL,
      )}
      style={{ flex: '0 0 auto', height, width }}
    >
      {!loading && (
        <div className={TABLE_ROW_SELECTION_CHECKBOX}>
          <Checkbox
            aria-label="Select all rows"
            checked={allRowsSelected}
            indeterminate={!allRowsSelected && someRowsSelected}
            onChange={(event) => table.getToggleAllRowsSelectedHandler()(event)}
          />
        </div>
      )}
    </div>
  );
}
