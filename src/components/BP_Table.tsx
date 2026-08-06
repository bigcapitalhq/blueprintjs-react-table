import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableOptions,
  HTMLPropsRef,
} from '../types.ts';
import { useBPTableInstance } from '../hooks/use-bp-table-instance.ts';
import { TableBody } from './body/TableBody.tsx';

export type BP_TableProps<TData extends BP_RowData> =
  BP_TableOptions<BP_TableFeatures, TData> & {
    htmlProps?: HTMLPropsRef<HTMLTableElement>;
  };

export function BP_Table<TData extends BP_RowData>({
  htmlProps,
  ...tableOptions
}: BP_TableProps<TData>) {
  const table = useBPTableInstance<TData>(tableOptions);

  return (
    <table {...htmlProps}>
      <TableBody table={table} />
    </table>
  );
}
