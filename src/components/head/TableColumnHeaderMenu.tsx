import classNames from 'classnames';
import {
  Icon,
  Menu,
  MenuItem,
  PopoverNext,
} from '@blueprintjs/core';
import { type Header } from '@tanstack/react-table';
import {
  TABLE_TH_MENU,
  TABLE_TH_MENU_CONTAINER,
  TABLE_TH_MENU_CONTAINER_BACKGROUND,
  TABLE_TH_MENU_OPEN,
} from '../common/classes.ts';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';

export type TableColumnHeaderMenuProps<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  header: Header<BP_TableFeatures, TData, unknown>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export function TableColumnHeaderMenu<TData extends BP_RowData>({
  header,
  isOpen,
  onOpenChange,
}: TableColumnHeaderMenuProps<TData>) {
  const isSorted = header.column.getIsSorted();

  const handleSort = (desc: boolean) => {
    header.column.toggleSorting(desc);
    onOpenChange(false);
  };

  const handleClearSort = () => {
    header.column.clearSorting();
    onOpenChange(false);
  };

  return (
    <div className={classNames(TABLE_TH_MENU_CONTAINER, { [TABLE_TH_MENU_OPEN]: isOpen })}>
      <div className={TABLE_TH_MENU_CONTAINER_BACKGROUND} />
      <PopoverNext
        className={TABLE_TH_MENU}
        content={
          <Menu>
            <MenuItem icon="sort-asc" text="Sort Asc" onClick={() => handleSort(false)} />
            <MenuItem icon="sort-desc" text="Sort Desc" onClick={() => handleSort(true)} />
            {isSorted && <MenuItem icon="sort" text="Clear Sort" onClick={handleClearSort} />}
          </Menu>
        }
        isOpen={isOpen}
        onInteraction={onOpenChange}
        placement="bottom"
        rootBoundary="viewport"
      >
        <Icon icon="chevron-down" />
      </PopoverNext>
    </div>
  );
}