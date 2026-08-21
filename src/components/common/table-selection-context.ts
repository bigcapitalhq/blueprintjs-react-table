import { createContext, useContext } from 'react';
import type { CellFocusSelectionApi } from '../../hooks/use-cell-focus-selection.ts';

export const TableSelectionContext = createContext<CellFocusSelectionApi | null>(null);

export function useTableSelection(): CellFocusSelectionApi | null {
  return useContext(TableSelectionContext);
}
