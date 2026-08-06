import classNames from 'classnames';
import { Classes } from '@blueprintjs/core';
import { LoadableContent } from '../common/LoadableContent.tsx';
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
  loading: boolean;
  isLastInColumn: boolean;
};

export function TableRowHeaderCell({
  rowIndex,
  rowHeight,
  loading,
  isLastInColumn,
  className,
  ...restProps
}: TableRowHeaderCellProps) {
  return (
    <div
      {...restProps}
      className={classNames(TABLE_HEADER, rowCellIndexClass(rowIndex), {
        [TABLE_LAST_IN_COLUMN]: isLastInColumn,
        [Classes.LOADING]: loading,
      }, className)}
      style={{ flexBasis: rowHeight, height: rowHeight, minHeight: 0 }}
    >
      <div className={TABLE_ROW_NAME}>
        <div className={TABLE_ROW_NAME_TEXT}>
          <LoadableContent loading={loading}>
            <span>{rowIndex + 1}</span>
          </LoadableContent>
        </div>
      </div>
      <div className={classNames(TABLE_RESIZE_HANDLE_TARGET, TABLE_RESIZE_HORIZONTAL)}>
        <div className={TABLE_RESIZE_HANDLE} />
      </div>
    </div>
  );
}
