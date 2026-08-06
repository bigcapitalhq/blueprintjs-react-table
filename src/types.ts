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
export type BP_CellValue = unknown;

export type BP_DefinedTableOptions<TFeatures extends TableFeatures, TData extends RowData> = Omit<TableOptions<TFeatures, TData>, 'features'>;

export type BP_TableOptions<TFeatures extends TableFeatures, TData extends RowData> = BP_DefinedTableOptions<TFeatures, TData> & {
  features?: TableFeatures;
};
export type BP_TableFeatures = TableFeatures;
export type BP_TableState = TableState<BP_TableFeatures>;
export type BP_TableInstance<TData extends BP_RowData = BP_RowData> =
  ReactTable<BP_TableFeatures, TData>;
