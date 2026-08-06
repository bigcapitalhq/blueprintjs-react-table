import classNames from 'classnames';
import {
  TABLE_HEADER,
  TABLE_LAST_IN_COLUMN,
  TABLE_RESIZE_HANDLE,
  TABLE_RESIZE_HANDLE_TARGET,
  TABLE_RESIZE_HORIZONTAL,
  TABLE_ROW_NAME,
  TABLE_ROW_NAME_TEXT,
  rowCellIndexClass,
} from '../common/classes.ts';
import type { HTMLPropsRef } from '../../types.ts';

export type TableRowHeaderCellProps = HTMLPropsRef<HTMLDivElement> & {
  rowIndex: number;
  rowHeight: number;
  isLastInColumn: boolean;
};

export function TableRowHeaderCell({
  rowIndex,
  rowHeight,
  isLastInColumn,
  className,
  ...restProps
}: TableRowHeaderCellProps) {
  return (
    <div
      {...restProps}
      className={classNames(TABLE_HEADER, rowCellIndexClass(rowIndex), {
        [TABLE_LAST_IN_COLUMN]: isLastInColumn,
      }, className)}
      style={{ flexBasis: rowHeight, height: rowHeight, minHeight: 0 }}
    >
      <div className={TABLE_ROW_NAME}>
        <div className={TABLE_ROW_NAME_TEXT}>{rowIndex + 1}</div>
      </div>
      <div className={classNames(TABLE_RESIZE_HANDLE_TARGET, TABLE_RESIZE_HORIZONTAL)}>
        <div className={TABLE_RESIZE_HANDLE} />
      </div>
    </div>
  );
}
