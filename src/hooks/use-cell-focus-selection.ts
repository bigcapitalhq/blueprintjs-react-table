import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type {
  BP_RowData,
  BP_TableInstance,
} from '../types.ts';
import { getCellFromClientPoint } from '../components/common/cellCoordinates.ts';
import {
  getFrozenColumnCount,
  getFrozenColumnsWidth,
  getFrozenRowCount,
  getFrozenRowsHeight,
} from '../components/common/pinning.ts';
import {
  Direction,
  FocusMode,
  Regions,
  moveFocusedCell,
  resizeRegion,
  RegionCardinality,
  type CellCoordinates,
  type FocusedCellCoordinates,
  type FocusedRegion,
  type Region,
  type StyledRegionGroup,
} from '../components/common/region.ts';

export type CellFocusSelectionOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  /** Resolved absolute top offset of the row at the given index. */
  getRowTop: (index: number) => number;
  /** Resolved height of the row at the given index. */
  getRowHeight: (index: number) => number;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  /** Width of the frozen row-header column. */
  rowHeaderWidth: number;
  /** Effective height of the column-header area. */
  columnHeaderHeight: number;

  enableFocusedCell?: boolean;
  focusedCell?: FocusedCellCoordinates | undefined;
  onFocusedCell?: (cell: FocusedCellCoordinates) => void;
  onFocusedRegion?: (region: FocusedRegion) => void;

  selectedRegions?: Region[] | undefined;
  onSelection?: (regions: Region[]) => void;
  enableMultipleSelection?: boolean;
  selectionModes?: RegionCardinality[];
};

export type CellFocusSelectionApi = {
  focusedRegion: FocusedRegion | undefined;
  selectedRegions: Region[];
  regionGroups: StyledRegionGroup[];
  isSelectionModeEnabled: (cardinality: RegionCardinality) => boolean;
  handleKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>) => void;
  handleBodyPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleBodyPointerMove: (event: ReactPointerEvent<HTMLDivElement>) => void;
  handleBodyPointerUp: () => void;
  handleBodyPointerCancel: () => void;
  handleColumnHeaderMouseDown: (index: number, event: ReactMouseEvent) => void;
  handleRowHeaderMouseDown: (index: number, event: ReactMouseEvent) => void;
  handleMenuMouseDown: (event: ReactMouseEvent) => void;
};

type DragState = {
  anchor: CellCoordinates;
  last: CellCoordinates;
  dragging: boolean;
};

function getFocusedOrLastSelectedIndex(selectedRegions: Region[], focusedRegion?: FocusedRegion) {
  if (selectedRegions.length === 0) {
    return undefined;
  }
  if (focusedRegion != null) {
    return focusedRegion.focusSelectionIndex;
  }
  return selectedRegions.length - 1;
}

const EMPTY_REGIONS: Region[] = [];

export function useCellFocusSelection<TData extends BP_RowData>({
  table,
  getRowTop,
  getRowHeight,
  scrollContainerRef,
  rowHeaderWidth,
  columnHeaderHeight,
  enableFocusedCell = false,
  focusedCell,
  onFocusedCell,
  onFocusedRegion,
  selectedRegions: controlledSelectedRegions,
  onSelection,
  selectionModes,
}: CellFocusSelectionOptions<TData>): CellFocusSelectionApi {
  const isFocusEnabled = enableFocusedCell;
  const isFocusControlled = focusedCell != null;
  const isSelectionControlled = controlledSelectedRegions != null;

  const [focusedRegionState, setFocusedRegionState] = useState<FocusedRegion | undefined>(() =>
    isFocusEnabled ? { type: FocusMode.CELL, col: 0, focusSelectionIndex: 0, row: 0 } : undefined,
  );
  const [selectedRegionsState, setSelectedRegionsState] = useState<Region[]>([]);

  const focusedRegion: FocusedRegion | undefined = useMemo(() => {
    if (isFocusControlled) {
      return focusedCell != null
        ? { ...focusedCell, type: FocusMode.CELL, focusSelectionIndex: 0 }
        : undefined;
    }
    return focusedRegionState;
  }, [focusedCell, focusedRegionState, isFocusControlled]);

  const selectedRegions: Region[] = useMemo(() => {
    if (isSelectionControlled) {
      return controlledSelectedRegions ?? EMPTY_REGIONS;
    }
    return selectedRegionsState;
  }, [controlledSelectedRegions, isSelectionControlled, selectedRegionsState]);

  const dragRef = useRef<DragState | null>(null);

  const isSelectionModeEnabled = useCallback(
    (cardinality: RegionCardinality) => {
      if (selectionModes == null) {
        return true;
      }
      return selectionModes.includes(cardinality);
    },
    [selectionModes],
  );

  const handleFocus = useCallback(
    (region: FocusedRegion) => {
      if (!isFocusEnabled) {
        return;
      }
      if (!isFocusControlled) {
        setFocusedRegionState(region);
      }
      onFocusedCell?.({ row: region.row, col: region.col });
      onFocusedRegion?.(region);
    },
    [isFocusControlled, isFocusEnabled, onFocusedCell, onFocusedRegion],
  );

  const handleSelection = useCallback(
    (regions: Region[]) => {
      if (!isSelectionControlled) {
        setSelectedRegionsState(regions);
      }
      onSelection?.(regions);
    },
    [isSelectionControlled, onSelection],
  );

  const focusContainer = useCallback(() => {
    if (isFocusEnabled) {
      scrollContainerRef.current?.focus();
    }
  }, [isFocusEnabled, scrollContainerRef]);

  const scrollToFocusedRegion = useCallback(
    (region: FocusedRegion) => {
      const el = scrollContainerRef.current;
      if (el == null) {
        return;
      }
      const columns = table.getVisibleLeafColumns();
      const column = columns[region.col];
      if (column == null) {
        return;
      }
      const frozenColumnCount = getFrozenColumnCount(table);
      const frozenColumnsWidth = getFrozenColumnsWidth(table);
      const frozenRowCount = getFrozenRowCount(table);
      const frozenRowsHeight = getFrozenRowsHeight(table, getRowHeight);

      // The cell's position in the content coordinate space (frozen columns
      // and rows first, scrollable region after them; `column.getStart()` and
      // the row tops are absolute grid offsets).
      const columnLeft = column.getStart();
      const columnRight = columnLeft + column.getSize();
      const rowTop = getRowTop(region.row);
      const rowBottom = rowTop + getRowHeight(region.row);

      // The visible cell area excludes the row-header column, the
      // column-header area, and the frozen rows/columns: those never scroll and
      // always cover their part of the viewport.
      const viewportWidth = el.clientWidth - rowHeaderWidth - frozenColumnsWidth;
      const viewportHeight = el.clientHeight - columnHeaderHeight - frozenRowsHeight;

      let nextScrollLeft = el.scrollLeft;
      let nextScrollTop = el.scrollTop;

      if (region.col >= frozenColumnCount) {
        const left = columnLeft - frozenColumnsWidth;
        const right = columnRight - frozenColumnsWidth;
        if (left < nextScrollLeft) {
          nextScrollLeft = Math.max(0, left);
        } else if (right > nextScrollLeft + viewportWidth) {
          nextScrollLeft = right - viewportWidth;
        }
      }
      if (region.row >= frozenRowCount) {
        const top = rowTop - frozenRowsHeight;
        const bottom = rowBottom - frozenRowsHeight;
        if (top < nextScrollTop) {
          nextScrollTop = Math.max(0, top);
        } else if (bottom > nextScrollTop + viewportHeight) {
          nextScrollTop = bottom - viewportHeight;
        }
      }

      if (nextScrollLeft !== el.scrollLeft) {
        el.scrollLeft = nextScrollLeft;
      }
      if (nextScrollTop !== el.scrollTop) {
        el.scrollTop = nextScrollTop;
      }
    },
    [
      columnHeaderHeight,
      getRowHeight,
      getRowTop,
      rowHeaderWidth,
      scrollContainerRef,
      table,
    ],
  );

  const moveFocus = useCallback(
    (direction: Direction) => {
      if (focusedRegion == null) {
        return;
      }
      const next = moveFocusedCell(focusedRegion, direction);
      const maxRow = table.getRowModel().rows.length - 1;
      const maxCol = table.getVisibleLeafColumns().length - 1;
      if (next.row < 0 || next.row > maxRow || next.col < 0 || next.col > maxCol) {
        return;
      }
      handleSelection([Regions.getRegionFromFocusedRegion(next)]);
      handleFocus(next);
      scrollToFocusedRegion(next);
    },
    [focusedRegion, handleFocus, handleSelection, scrollToFocusedRegion, table],
  );

  const resizeSelection = useCallback(
    (direction: Direction) => {
      if (selectedRegions.length === 0) {
        if (focusedRegion != null) {
          handleSelection([Regions.getRegionFromFocusedRegion(focusedRegion)]);
        }
        return;
      }
      const index = getFocusedOrLastSelectedIndex(selectedRegions, focusedRegion);
      if (index == null) {
        return;
      }
      const next = resizeRegion(selectedRegions[index], direction, focusedRegion);
      const maxRow = table.getRowModel().rows.length - 1;
      const maxCol = table.getVisibleLeafColumns().length - 1;
      const clamped = Regions.clampRegion(next, maxRow, maxCol);
      handleSelection(Regions.update(selectedRegions, clamped, index));
    },
    [focusedRegion, handleSelection, selectedRegions, table],
  );

  const selectAll = useCallback(() => {
    handleSelection([Regions.table()]);
  }, [handleSelection]);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key;

      let direction: Direction | undefined;
      if (key === 'ArrowUp') {
        direction = Direction.UP;
      } else if (key === 'ArrowDown') {
        direction = Direction.DOWN;
      } else if (key === 'ArrowLeft') {
        direction = Direction.LEFT;
      } else if (key === 'ArrowRight') {
        direction = Direction.RIGHT;
      }

      if (direction != null) {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          resizeSelection(direction);
        } else if (isFocusEnabled) {
          moveFocus(direction);
        }
        return;
      }

      if (key === 'Tab' && isFocusEnabled) {
        event.preventDefault();
        event.stopPropagation();
        if (event.shiftKey) {
          moveFocus(Direction.LEFT);
        } else {
          moveFocus(Direction.RIGHT);
        }
        return;
      }

      if (modifier && key.toLowerCase() === 'a') {
        event.preventDefault();
        event.stopPropagation();
        selectAll();
      }
    },
    [isFocusEnabled, moveFocus, resizeSelection, selectAll],
  );

  const getCellFromEvent = useCallback(
    (clientX: number, clientY: number) =>
      getCellFromClientPoint(
        { table, scrollContainerRef, rowHeaderWidth, columnHeaderHeight, getRowTop, getRowHeight },
        clientX,
        clientY,
      ),
    [columnHeaderHeight, getRowHeight, getRowTop, rowHeaderWidth, scrollContainerRef, table],
  );

  const handleBodyPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const cell = getCellFromEvent(event.clientX, event.clientY);
      if (cell == null) {
        return;
      }
      dragRef.current = { anchor: cell, dragging: false, last: cell };
      try {
        event.currentTarget.setPointerCapture?.(event.pointerId);
      } catch {
        // Synthetic events (and some embedded contexts) may not support pointer capture.
      }

      if (event.shiftKey && focusedRegion != null) {
        const index = getFocusedOrLastSelectedIndex(selectedRegions, focusedRegion);
        const base = index != null ? selectedRegions[index] : Regions.getRegionFromFocusedRegion(focusedRegion);
        handleSelection([Regions.expandRegion(base, Regions.cell(cell.row, cell.col))]);
      } else {
        handleSelection([Regions.cell(cell.row, cell.col)]);
        handleFocus({ type: FocusMode.CELL, col: cell.col, focusSelectionIndex: 0, row: cell.row });
      }
      focusContainer();
    },
    [focusedRegion, focusContainer, getCellFromEvent, handleFocus, handleSelection, selectedRegions],
  );

  const handleBodyPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (drag == null) {
        return;
      }
      const cell = getCellFromEvent(event.clientX, event.clientY);
      if (cell == null) {
        return;
      }
      if (drag.dragging && cell.row === drag.last.row && cell.col === drag.last.col) {
        return;
      }
      drag.last = cell;
      drag.dragging = true;
      handleSelection([Regions.cell(drag.anchor.row, drag.anchor.col, cell.row, cell.col)]);
    },
    [getCellFromEvent, handleSelection],
  );

  const handleBodyPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleBodyPointerCancel = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handleColumnHeaderMouseDown = useCallback(
    (index: number, event: ReactMouseEvent) => {
      if (!isSelectionModeEnabled(RegionCardinality.FULL_COLUMNS)) {
        handleSelection([]);
        focusContainer();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        const selectionIndex = getFocusedOrLastSelectedIndex(selectedRegions, focusedRegion);
        const base = selectionIndex != null ? selectedRegions[selectionIndex] : Regions.column(index, index);
        handleSelection([Regions.expandRegion(base, Regions.column(index, index))]);
      } else {
        handleSelection([Regions.column(index, index)]);
        handleFocus({ type: FocusMode.CELL, col: index, focusSelectionIndex: 0, row: 0 });
      }
      focusContainer();
    },
    [focusedRegion, focusContainer, handleFocus, handleSelection, isSelectionModeEnabled, selectedRegions],
  );

  const handleRowHeaderMouseDown = useCallback(
    (index: number, event: ReactMouseEvent) => {
      if (!isSelectionModeEnabled(RegionCardinality.FULL_ROWS)) {
        handleSelection([]);
        focusContainer();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      if (event.shiftKey) {
        const selectionIndex = getFocusedOrLastSelectedIndex(selectedRegions, focusedRegion);
        const base = selectionIndex != null ? selectedRegions[selectionIndex] : Regions.row(index, index);
        handleSelection([Regions.expandRegion(base, Regions.row(index, index))]);
      } else {
        handleSelection([Regions.row(index, index)]);
        handleFocus({ type: FocusMode.CELL, col: 0, focusSelectionIndex: 0, row: index });
      }
      focusContainer();
    },
    [focusedRegion, focusContainer, handleFocus, handleSelection, isSelectionModeEnabled, selectedRegions],
  );

  const handleMenuMouseDown = useCallback(
    (event: ReactMouseEvent) => {
      if (!isSelectionModeEnabled(RegionCardinality.FULL_TABLE)) {
        handleSelection([]);
        focusContainer();
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      handleSelection([Regions.table()]);
      focusContainer();
    },
    [focusContainer, handleSelection, isSelectionModeEnabled],
  );

  const regionGroups: StyledRegionGroup[] = useMemo(
    () => Regions.joinStyledRegionGroups(selectedRegions, focusedRegion),
    [focusedRegion, selectedRegions],
  );

  return {
    focusedRegion,
    handleBodyPointerCancel,
    handleBodyPointerDown,
    handleBodyPointerMove,
    handleBodyPointerUp,
    handleColumnHeaderMouseDown,
    handleKeyDown,
    handleMenuMouseDown,
    handleRowHeaderMouseDown,
    isSelectionModeEnabled,
    regionGroups,
    selectedRegions,
  };
}
