import classNames from 'classnames';
import { TABLE_MENU } from '../common/classes.ts';
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
  return (
    <div
      {...restProps}
      className={classNames(TABLE_MENU, className)}
      style={{ width, height }}
    />
  );
}
