import classNames from 'classnames';
import { Checkbox, Classes } from '@blueprintjs/core';
import { type Row } from '@tanstack/react-table';
import {
  TABLE_HEADER,
  TABLE_LAST_IN_COLUMN,
  TABLE_ROW_SELECTED,
  TABLE_ROW_SELECTION_CELL,
  TABLE_ROW_SELECTION_CHECKBOX,
  rowCellIndexClass,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
} from '../../types.ts';

export type TableRowSelectionCellProps<TData extends BP_RowData> = {
  /**
   * The TanStack row rendered by this cell. Undefined only while the row model
   * has no row at the given index.
   */
  row?: Row<BP_TableFeatures, TData>;
  rowIndex: number;
  rowHeight: number;
  loading: boolean;
  isLastInColumn: boolean;
};

/**
 * One row of the row-selection checkboxes column that sits between the row
 * header (row numbers) and the frozen columns.
 */
export function TableRowSelectionCell<TData extends BP_RowData>({
  row,
  rowIndex,
  rowHeight,
  loading,
  isLastInColumn,
}: TableRowSelectionCellProps<TData>) {
  const isSelected = row?.getIsSelected() ?? false;
  return (
    <div
      className={classNames(TABLE_HEADER, TABLE_ROW_SELECTION_CELL, rowCellIndexClass(rowIndex), {
        [TABLE_LAST_IN_COLUMN]: isLastInColumn,
        [Classes.LOADING]: loading,
        [TABLE_ROW_SELECTED]: isSelected,
      })}
      style={{ height: rowHeight }}
    >
      {!loading && row != null && (
        <div className={TABLE_ROW_SELECTION_CHECKBOX}>
          <Checkbox
            aria-label={`Select row ${rowIndex + 1}`}
            checked={isSelected}
            disabled={!row.getCanSelect()}
            onChange={(event) => row.getToggleSelectedHandler()(event)}
          />
        </div>
      )}
    </div>
  );
}
