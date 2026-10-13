import type { ReactElement } from 'react';
import type { Cell, Row } from '@tanstack/react-table';
import type {
  BP_RowData,
  BP_TableFeatures,
  BP_TableInstance,
} from '../../types.ts';
import {
  Regions,
  type CellCoordinates,
  type NonNullRegion,
  type Region,
} from './region.ts';

/**
 * Describes the region(s) of interest for a body context menu, mirroring
 * Blueprint's `MenuContext`.
 */
export interface BP_MenuContext<TData extends BP_RowData = BP_RowData> {
  /**
   * Returns a region containing the single cell that was right-clicked to
   * launch this context menu.
   */
  getTarget(): NonNullRegion;

  /**
   * Returns an array of `Region`s that represent the user-intended context of
   * this menu. If the right-click happened inside the current selection, the
   * array contains all selected regions. Otherwise it contains one `Region`
   * that represents the right-clicked cell (the same region from
   * `getTarget`).
   */
  getRegions(): Region[];

  /**
   * Returns the list of selected `Region`s in the table, regardless of where
   * the user right-clicked to launch the context menu. For the user-intended
   * regions for this context, use `getRegions` instead.
   */
  getSelectedRegions(): Region[];

  /**
   * Returns an array containing all of the unique, potentially non-contiguous,
   * cells contained in all the regions from `getRegions`. The cell
   * coordinates are sorted by row and then column.
   */
  getUniqueCells(): CellCoordinates[];

  /**
   * Returns the TanStack row that was right-clicked, or `undefined` when the
   * click did not land on a body cell.
   */
  getTargetRow(): Row<BP_TableFeatures, TData> | undefined;

  /**
   * Returns the TanStack cell that was right-clicked, or `undefined` when the
   * click did not land on a body cell.
   */
  getTargetCell(): Cell<BP_TableFeatures, TData, unknown> | undefined;
}

/**
 * Renders a context menu for the table body, mirroring Blueprint's
 * `bodyContextMenuRenderer`. Return `undefined` (or `null`) to fall back to
 * the browser's native context menu.
 */
export type BP_BodyContextMenuRenderer<TData extends BP_RowData = BP_RowData> = (
  context: BP_MenuContext<TData>,
) => ReactElement | null | undefined;

export type BP_MenuContextOptions<TData extends BP_RowData> = {
  table: BP_TableInstance<TData>;
  /** The right-clicked cell, as a single-cell region. */
  target: NonNullRegion;
  /** The table's current selection, unaffected by the right-click itself. */
  selectedRegions: Region[];
  numRows: number;
  numCols: number;
};

/**
 * Concrete {@link BP_MenuContext}. The user-intended regions are the current
 * selection when it contains the right-clicked cell, and the cell itself
 * otherwise.
 */
export class BP_MenuContextImpl<TData extends BP_RowData> implements BP_MenuContext<TData> {
  private readonly target: NonNullRegion;
  private readonly regions: Region[];
  private readonly selectedRegions: Region[];
  private readonly numRows: number;
  private readonly numCols: number;
  private readonly targetRow: Row<BP_TableFeatures, TData> | undefined;
  private readonly targetCell: Cell<BP_TableFeatures, TData, unknown> | undefined;

  constructor({ table, target, selectedRegions, numRows, numCols }: BP_MenuContextOptions<TData>) {
    this.target = target;
    this.selectedRegions = selectedRegions;
    this.numRows = numRows;
    this.numCols = numCols;
    this.regions = Regions.overlapsRegion(selectedRegions, target) ? selectedRegions : [target];
    this.targetRow = table.getRowModel().rows[target.rows[0]];
    this.targetCell = this.targetRow?.getVisibleCells()[target.cols[0]];
  }

  public getTarget(): NonNullRegion {
    return this.target;
  }

  public getRegions(): Region[] {
    return this.regions;
  }

  public getSelectedRegions(): Region[] {
    return this.selectedRegions;
  }

  public getUniqueCells(): CellCoordinates[] {
    return Regions.enumerateUniqueCells(this.regions, this.numRows, this.numCols);
  }

  public getTargetRow(): Row<BP_TableFeatures, TData> | undefined {
    return this.targetRow;
  }

  public getTargetCell(): Cell<BP_TableFeatures, TData, unknown> | undefined {
    return this.targetCell;
  }
}
