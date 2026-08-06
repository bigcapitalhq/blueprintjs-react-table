import { type Row } from '@tanstack/react-table';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableBodyCell } from './TableBodyCell.tsx';

export type TableBodyRowProps<TData extends BP_RowData> = HTMLPropsRef<HTMLTableRowElement> & {
  table: BP_TableInstance<TData>;
  row: Row<BP_TableFeatures, TData>;
};

export function TableBodyRow<TData extends BP_RowData>({
  table,
  row,
  ...restProps
}: TableBodyRowProps<TData>) {
  return (
    <tr {...restProps}>
      {row.getAllCells().map((cell) => (
        <TableBodyCell key={cell.id} table={table} cell={cell} />
      ))}
    </tr>
  );
}
