import classNames from 'classnames';
import { TABLE_MENU } from '../common/classes.ts';
import { useTableSelection } from '../common/table-selection-context.ts';
import type { HTMLPropsRef } from '../../types.ts';

export type TableMenuProps = HTMLPropsRef<HTMLDivElement> & {
  width: number;
  height: number;
};

export function TableMenu({
  width,
  height,
  className,
  ...restProps
}: TableMenuProps) {
  const selection = useTableSelection();
  return (
    <div
      {...restProps}
      className={classNames(TABLE_MENU, className)}
      style={{ width, height }}
      onMouseDown={selection?.handleMenuMouseDown}
    />
  );
}
