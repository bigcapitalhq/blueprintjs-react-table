import type {
  BP_RowData,
  BP_TableInstance,
  HTMLPropsRef,
} from '../../types.ts';
import { TableBodyRow } from './TableBodyRow.tsx';

export type TableBodyProps<TData extends BP_RowData> = HTMLPropsRef<HTMLTableSectionElement> & {
  table: BP_TableInstance<TData>;
};

export function TableBody<TData extends BP_RowData>({
  table,
  ...restProps
}: TableBodyProps<TData>) {
  return (
    <tbody {...restProps}>
      {table.getRowModel().rows.map((row) => (
        <TableBodyRow key={row.id} table={table} row={row} />
      ))}
    </tbody>
  );
}
