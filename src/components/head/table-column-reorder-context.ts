import { createContext, useContext } from 'react';
import type { ColumnReorderContextValue } from '../../hooks/use-column-reorder.ts';

export const TableColumnReorderContext = createContext<ColumnReorderContextValue | null>(null);

export function useTableColumnReorder(): ColumnReorderContextValue | null {
  return useContext(TableColumnReorderContext);
}
