import { type Cell } from '@tanstack/react-table';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';

export type TableBodyCellProps<TData extends BP_RowData> = HTMLPropsRef<HTMLTableCellElement> & {
  table: BP_TableInstance<TData>;
  cell: Cell<BP_TableFeatures, TData, unknown>;
};

export function TableBodyCell<TData extends BP_RowData>({
  table,
  cell,
  ...restProps
}: TableBodyCellProps<TData>) {
  return (
    <td {...restProps}>
      <table.FlexRender cell={cell} />
    </td>
  );
}
