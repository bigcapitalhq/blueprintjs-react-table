import {
  TABLE_FOCUS_REGION,
  TABLE_SELECTION_REGION,
} from './classes.ts';

export enum RegionCardinality {
  CELLS = 'cells',
  FULL_ROWS = 'full-rows',
  FULL_COLUMNS = 'full-columns',
  FULL_TABLE = 'full-table',
}

export enum FocusMode {
  CELL = 'cell',
}

export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
}

export type CellInterval = [number, number];
export type CellCoordinates = { row: number; col: number };
export type FocusedCellCoordinates = CellCoordinates;

export type Region = {
  rows?: CellInterval | null;
  cols?: CellInterval | null;
};

export type NonNullRegion = Required<{
  [P in keyof Region]: NonNullable<Region[P]>;
}>;

export type FocusedRegion = {
  type: FocusMode.CELL;
  row: number;
  col: number;
  focusSelectionIndex: number;
};

export type StyledRegionGroup = {
  className?: string;
  regions: Region[];
};

export class Regions {
  public static getRegionCardinality(region: Region): RegionCardinality {
    if (region.cols != null && region.rows != null) {
      return RegionCardinality.CELLS;
    } else if (region.cols != null) {
      return RegionCardinality.FULL_COLUMNS;
    } else if (region.rows != null) {
      return RegionCardinality.FULL_ROWS;
    } else {
      return RegionCardinality.FULL_TABLE;
    }
  }

  public static cell(row: number, col: number, row2?: number, col2?: number): NonNullRegion {
    return {
      cols: Regions.normalizeInterval(col, col2),
      rows: Regions.normalizeInterval(row, row2),
    };
  }

  public static row(row: number, row2?: number): Region {
    return { rows: Regions.normalizeInterval(row, row2) };
  }

  public static column(col: number, col2?: number): Region {
    return { cols: Regions.normalizeInterval(col, col2) };
  }

  public static table(): Region {
    return {};
  }

  public static copy(region: Region): Region {
    const cardinality = Regions.getRegionCardinality(region);
    if (cardinality === RegionCardinality.CELLS) {
      return Regions.cell(region.rows![0], region.cols![0], region.rows![1], region.cols![1]);
    } else if (cardinality === RegionCardinality.FULL_COLUMNS) {
      return Regions.column(region.cols![0], region.cols![1]);
    } else if (cardinality === RegionCardinality.FULL_ROWS) {
      return Regions.row(region.rows![0], region.rows![1]);
    }
    return Regions.table();
  }

  public static update(regions: Region[], region: Region, index?: number): Region[] {
    const copy = regions.slice();
    if (index != null) {
      copy.splice(index, 1, region);
    } else {
      copy.pop();
      copy.push(region);
    }
    return copy;
  }

  public static clampRegion(region: Region, maxRowIndex: number, maxColumnIndex: number): Region {
    const nextRegion = Regions.copy(region);
    if (region.rows != null) {
      nextRegion.rows![0] = Regions.clamp(region.rows[0], 0, maxRowIndex);
      nextRegion.rows![1] = Regions.clamp(region.rows[1], 0, maxRowIndex);
    }
    if (region.cols != null) {
      nextRegion.cols![0] = Regions.clamp(region.cols[0], 0, maxColumnIndex);
      nextRegion.cols![1] = Regions.clamp(region.cols[1], 0, maxColumnIndex);
    }
    return nextRegion;
  }

  public static expandRegion(oldRegion: Region, newRegion: Region): Region {
    const oldCardinality = Regions.getRegionCardinality(oldRegion);
    const newCardinality = Regions.getRegionCardinality(newRegion);
    if (newCardinality !== oldCardinality) {
      return newRegion;
    }
    switch (newCardinality) {
      case RegionCardinality.FULL_ROWS:
        return Regions.row(
          Math.min(oldRegion.rows![0], newRegion.rows![0]),
          Math.max(oldRegion.rows![1], newRegion.rows![1]),
        );
      case RegionCardinality.FULL_COLUMNS:
        return Regions.column(
          Math.min(oldRegion.cols![0], newRegion.cols![0]),
          Math.max(oldRegion.cols![1], newRegion.cols![1]),
        );
      case RegionCardinality.CELLS:
        return Regions.cell(
          Math.min(oldRegion.rows![0], newRegion.rows![0]),
          Math.min(oldRegion.cols![0], newRegion.cols![0]),
          Math.max(oldRegion.rows![1], newRegion.rows![1]),
          Math.max(oldRegion.cols![1], newRegion.cols![1]),
        );
      default:
        return Regions.table();
    }
  }

  public static getRegionFromFocusedRegion(focusedRegion: FocusedRegion): Region {
    return Regions.cell(focusedRegion.row, focusedRegion.col);
  }

  public static getCellRegionFromRegion(region: Region, numRows: number, numCols: number): NonNullRegion {
    switch (Regions.getRegionCardinality(region)) {
      case RegionCardinality.FULL_TABLE:
        return Regions.cell(0, 0, numRows - 1, numCols - 1);
      case RegionCardinality.FULL_COLUMNS:
        return Regions.cell(0, region.cols![0], numRows - 1, region.cols![1]);
      case RegionCardinality.FULL_ROWS:
        return Regions.cell(region.rows![0], 0, region.rows![1], numCols - 1);
      default:
        return Regions.cell(region.rows![0], region.cols![0], region.rows![1], region.cols![1]);
    }
  }

  public static getFocusCellCoordinatesFromRegion(region: Region): CellCoordinates {
    switch (Regions.getRegionCardinality(region)) {
      case RegionCardinality.FULL_TABLE:
        return { col: 0, row: 0 };
      case RegionCardinality.FULL_COLUMNS:
        return { col: region.cols![0], row: 0 };
      case RegionCardinality.FULL_ROWS:
        return { col: 0, row: region.rows![0] };
      default:
        return { col: region.cols![0], row: region.rows![0] };
    }
  }

  public static regionsEqual(regionA: Region, regionB: Region): boolean {
    return Regions.intervalsEqual(regionA.rows, regionB.rows) && Regions.intervalsEqual(regionA.cols, regionB.cols);
  }

  /**
   * Returns the index of the region that wholly contains the supplied
   * region. Returns -1 if no such region is found.
   */
  public static findContainingRegion(regions: Region[] | null | undefined, region: Region): number {
    if (regions == null) {
      return -1;
    }
    for (let i = 0; i < regions.length; i++) {
      if (Regions.regionContains(regions[i], region)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Returns true if the regions fully contain the query region.
   */
  public static containsRegion(regions: Region[], query: Region): boolean {
    return Regions.overlapsRegion(regions, query, false);
  }

  /**
   * Returns true if the regions at least partially overlap the query region.
   * When `allowPartialOverlap` is false (the default), every interval of the
   * query region must be fully contained in the corresponding interval of a
   * region.
   */
  public static overlapsRegion(regions: Region[], query: Region, allowPartialOverlap = false): boolean {
    const intervalCompareFn = allowPartialOverlap ? Regions.intervalOverlaps : Regions.intervalContains;

    if (regions == null || query == null) {
      return false;
    }

    for (const region of regions) {
      const cardinality = Regions.getRegionCardinality(region);
      switch (cardinality) {
        case RegionCardinality.FULL_TABLE:
          return true;
        case RegionCardinality.FULL_COLUMNS:
          if (intervalCompareFn(region.cols!, query.cols)) {
            return true;
          }
          continue;
        case RegionCardinality.FULL_ROWS:
          if (intervalCompareFn(region.rows!, query.rows)) {
            return true;
          }
          continue;
        case RegionCardinality.CELLS:
          if (intervalCompareFn(region.cols!, query.cols) && intervalCompareFn(region.rows!, query.rows)) {
            return true;
          }
          continue;
        default:
          break;
      }
    }

    return false;
  }

  /**
   * Using the supplied array of potentially non-contiguous `Region`s, returns
   * an ordered array of every unique cell that exists in those regions. The
   * cell coordinates are sorted by row and then column.
   */
  public static enumerateUniqueCells(
    regions: Region[] | null | undefined,
    numRows: number,
    numCols: number,
  ): CellCoordinates[] {
    if (regions == null || regions.length === 0) {
      return [];
    }

    const seen = new Set<string>();
    const list: CellCoordinates[] = [];
    for (const region of regions) {
      Regions.eachCellInRegion(region, numRows, numCols, (row, col) => {
        const key = `${row}-${col}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ col, row });
        }
      });
    }

    list.sort((cellA, cellB) => cellA.row - cellB.row || cellA.col - cellB.col);
    return list;
  }

  public static joinStyledRegionGroups(
    selectedRegions: Region[] | undefined,
    focusedRegion: FocusedRegion | undefined,
  ): StyledRegionGroup[] {
    const regionGroups: StyledRegionGroup[] = [];
    if (selectedRegions != null && selectedRegions.length > 0) {
      regionGroups.push({ className: TABLE_SELECTION_REGION, regions: selectedRegions });
    }
    if (focusedRegion != null) {
      regionGroups.push({
        className: TABLE_FOCUS_REGION,
        regions: [Regions.getRegionFromFocusedRegion(focusedRegion)],
      });
    }
    return regionGroups;
  }

  private static regionContains(regionA: Region, regionB: Region): boolean {
    return Regions.overlapsRegion([regionA], regionB, false);
  }

  private static intervalContains(
    intervalA: CellInterval | null | undefined,
    intervalB: CellInterval | null | undefined,
  ): boolean {
    if (intervalA == null || intervalB == null) {
      return false;
    }
    return intervalA[0] <= intervalB[0] && intervalB[1] <= intervalA[1];
  }

  private static intervalOverlaps(
    intervalA: CellInterval | null | undefined,
    intervalB: CellInterval | null | undefined,
  ): boolean {
    if (intervalA == null || intervalB == null) {
      return false;
    }
    return intervalA[0] <= intervalB[1] && intervalB[0] <= intervalA[1];
  }

  private static eachCellInRegion(
    region: Region,
    numRows: number,
    numCols: number,
    iteratee: (row: number, col: number) => void,
  ): void {
    switch (Regions.getRegionCardinality(region)) {
      case RegionCardinality.FULL_TABLE:
        for (let row = 0; row < numRows; row++) {
          for (let col = 0; col < numCols; col++) {
            iteratee(row, col);
          }
        }
        break;
      case RegionCardinality.FULL_COLUMNS:
        for (let row = 0; row < numRows; row++) {
          for (let col = region.cols![0]; col <= region.cols![1]; col++) {
            iteratee(row, col);
          }
        }
        break;
      case RegionCardinality.FULL_ROWS:
        for (let row = region.rows![0]; row <= region.rows![1]; row++) {
          for (let col = 0; col < numCols; col++) {
            iteratee(row, col);
          }
        }
        break;
      case RegionCardinality.CELLS:
        for (let row = region.rows![0]; row <= region.rows![1]; row++) {
          for (let col = region.cols![0]; col <= region.cols![1]; col++) {
            iteratee(row, col);
          }
        }
        break;
      default:
        break;
    }
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  private static intervalsEqual(a: CellInterval | null | undefined, b: CellInterval | null | undefined): boolean {
    if (a == null) {
      return b == null;
    } else if (b == null) {
      return false;
    }
    return a[0] === b[0] && a[1] === b[1];
  }

  private static normalizeInterval(coord: number, coord2?: number): CellInterval {
    const interval: [number, number] = coord2 == null ? [coord, coord] : [coord, coord2];
    return interval.sort((a, b) => a - b);
  }
}

export function directionToDelta(direction: Direction): { rows: number; cols: number } {
  switch (direction) {
    case Direction.UP:
      return { rows: -1, cols: 0 };
    case Direction.DOWN:
      return { rows: 1, cols: 0 };
    case Direction.LEFT:
      return { rows: 0, cols: -1 };
    case Direction.RIGHT:
      return { rows: 0, cols: 1 };
  }
}

export function moveFocusedCell(focusedCell: FocusedRegion, direction: Direction): FocusedRegion {
  switch (direction) {
    case Direction.UP:
      return { ...focusedCell, focusSelectionIndex: 0, row: focusedCell.row - 1 };
    case Direction.DOWN:
      return { ...focusedCell, focusSelectionIndex: 0, row: focusedCell.row + 1 };
    case Direction.LEFT:
      return { ...focusedCell, col: focusedCell.col - 1, focusSelectionIndex: 0 };
    case Direction.RIGHT:
      return { ...focusedCell, col: focusedCell.col + 1, focusSelectionIndex: 0 };
  }
}

export function resizeRegion(region: Region, direction: Direction, focusedRegion?: FocusedRegion): Region {
  if (Regions.getRegionCardinality(region) === RegionCardinality.FULL_TABLE) {
    return region;
  }

  const nextRegion = Regions.copy(region);

  let affectedRowIndex = 0;
  let affectedColumnIndex = 0;

  if (focusedRegion != null) {
    const isAtTop = nextRegion.rows != null && focusedRegion.row === nextRegion.rows[0];
    const isAtBottom = nextRegion.rows != null && focusedRegion.row === nextRegion.rows[1];
    const isAtLeft = nextRegion.cols != null && focusedRegion.col === nextRegion.cols[0];
    const isAtRight = nextRegion.cols != null && focusedRegion.col === nextRegion.cols[1];

    if (direction === Direction.UP) {
      affectedRowIndex = isAtTop && !isAtBottom ? 1 : 0;
    } else if (direction === Direction.DOWN) {
      affectedRowIndex = isAtBottom && !isAtTop ? 0 : 1;
    } else if (direction === Direction.LEFT) {
      affectedColumnIndex = isAtLeft && !isAtRight ? 1 : 0;
    } else {
      affectedColumnIndex = isAtRight && !isAtLeft ? 0 : 1;
    }
  } else {
    affectedRowIndex = direction === Direction.DOWN ? 1 : 0;
    affectedColumnIndex = direction === Direction.RIGHT ? 1 : 0;
  }

  const delta = directionToDelta(direction);
  if (nextRegion.rows != null) {
    nextRegion.rows[affectedRowIndex] += delta.rows;
  }
  if (nextRegion.cols != null) {
    nextRegion.cols[affectedColumnIndex] += delta.cols;
  }

  return nextRegion;
}
