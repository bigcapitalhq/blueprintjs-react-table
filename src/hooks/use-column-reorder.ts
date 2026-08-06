import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject, PointerEvent as ReactPointerEvent } from 'react';
import type { Column } from '@tanstack/react-table';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../types.ts';

/**
 * Converts an absolute "guide" index (the boundary at which the preview guide
 * is shown) to the index the reordered column should occupy in the new order.
 * Mirrors Blueprint's `Utils.guideIndexToReorderedIndex` for a single column.
 *
 * Example: dragging column 0 past column 3 shows the guide at index 4; the
 * column should land at index 3.
 */
function guideIndexToReorderedIndex(oldIndex: number, guideIndex: number): number {
  if (guideIndex < oldIndex) {
    return guideIndex;
  } else if (oldIndex <= guideIndex && guideIndex < oldIndex + 1) {
    return oldIndex;
  } else {
    return Math.max(0, guideIndex - 1);
  }
}

export type ColumnReorderStartHandler = <TData extends BP_RowData>(
  column: Column<BP_TableFeatures, TData>,
  event: ReactPointerEvent<Element>,
) => void;

export type ColumnReorderContextValue = {
  enableColumnReordering: boolean;
  columnsRef: MutableRefObject<HTMLDivElement | null>;
  reorderingColumnId: string | null;
  startReorder: ColumnReorderStartHandler;
};

export function useColumnReorder<TData extends BP_RowData>(
  table: BP_TableInstance<TData>,
  enableColumnReordering: boolean,
) {
  const [reorderingColumnId, setReorderingColumnId] = useState<string | null>(null);
  const [guideIndex, setGuideIndex] = useState<number | null>(null);

  const columnsRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ oldIndex: number } | null>(null);

  const getGuideIndex = useCallback((clientX: number): number => {
    const originLeft = columnsRef.current?.getBoundingClientRect().left ?? 0;
    const relativeX = clientX - originLeft;
    let guide = 0;
    for (const column of table.getVisibleLeafColumns()) {
      const midpoint = column.getStart() + column.getSize() / 2;
      if (midpoint < relativeX) {
        guide++;
      } else {
        break;
      }
    }
    return guide;
  }, [table]);

  const endReorder = useCallback((clientX: number) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setReorderingColumnId(null);
    setGuideIndex(null);
    if (drag == null) {
      return;
    }
    const columns = table.getVisibleLeafColumns();
    const draggedColumnId = columns[drag.oldIndex]?.id;
    if (draggedColumnId == null) {
      return;
    }
    const reorderedIndex = guideIndexToReorderedIndex(drag.oldIndex, getGuideIndex(clientX));
    const nextOrder = columns.map((column) => column.id).filter((id) => id !== draggedColumnId);
    nextOrder.splice(reorderedIndex, 0, draggedColumnId);
    table.setColumnOrder(nextOrder);
  }, [getGuideIndex, table]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (dragRef.current == null) {
      return;
    }
    setGuideIndex(getGuideIndex(event.clientX));
  }, [getGuideIndex]);

  const handlePointerUp = useCallback((event: PointerEvent) => {
    endReorder(event.clientX);
  }, [endReorder]);

  const startReorder = useCallback<ColumnReorderStartHandler>((column, event) => {
    if (!enableColumnReordering) {
      return;
    }
    event.preventDefault();
    dragRef.current = { oldIndex: column.getIndex() };
    setReorderingColumnId(column.id);
    setGuideIndex(getGuideIndex(event.clientX));
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
  }, [enableColumnReordering, getGuideIndex, handlePointerMove, handlePointerUp]);

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const contextValue = useMemo<ColumnReorderContextValue>(
    () => ({ enableColumnReordering, columnsRef, reorderingColumnId, startReorder }),
    [enableColumnReordering, reorderingColumnId, startReorder],
  );

  return { columnsRef, contextValue, guideIndex, reorderingColumnId };
}
