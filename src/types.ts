import {
  type HTMLProps,
  type MutableRefObject,
} from 'react';
import { RowData, TableFeatures, TableOptions, TableState, ReactTable } from '@tanstack/react-table';

export type LiteralUnion<T extends U, U = string> =
  | (Record<never, never> & U)
  | T;
export type Prettify<T> = { [K in keyof T]: T[K] } & unknown;
export type Xor<A, B> =
  | Prettify<{ [k in keyof A]?: never } & B>
  | Prettify<{ [k in keyof B]?: never } & A>;

export type HTMLPropsRef<T extends HTMLElement> = {
  ref?: MutableRefObject<null | T> | null;
} & Omit<
  HTMLProps<T>,
  'color' | 'data' | 'label' | 'ref' | 'size' | 'style' | 'type'
>;
export type BP_DensityState = 'lg' | 'md' | 'sm' | 'xl' | 'xs';
export type BP_RowData<T = unknown> = Record<string, T>;

/**
 * Loading options that can be passed to the table to render skeleton
 * placeholders in the corresponding table regions.
 */
export enum TableLoadingOption {
  CELLS = 'cells',
  COLUMN_HEADERS = 'column-header',
  ROW_HEADERS = 'row-header',
}

/** Returns true if the supplied loading option is present in the given array. */
export function hasLoadingOption<T extends string>(loadingOptions: readonly T[], loadingOption: T) {
  return loadingOptions.indexOf(loadingOption) !== -1;
}

/** Which regions of the table are currently showing a loading placeholder. */
export type TableLoading = {
  areCellsLoading: boolean;
  areColumnHeadersLoading: boolean;
  areRowHeadersLoading: boolean;
};
export type BP_CellValue = unknown;

export type BP_DefinedTableOptions<TFeatures extends TableFeatures, TData extends RowData> = Omit<TableOptions<TFeatures, TData>, 'features'>;

export type BP_TableOptions<TFeatures extends TableFeatures, TData extends RowData> = BP_DefinedTableOptions<TFeatures, TData> & {
  features?: TableFeatures;
};
export type BP_TableFeatures = TableFeatures;
export type BP_TableState = TableState<BP_TableFeatures>;
export type BP_TableInstance<TData extends BP_RowData = BP_RowData> =
  ReactTable<BP_TableFeatures, TData>;
