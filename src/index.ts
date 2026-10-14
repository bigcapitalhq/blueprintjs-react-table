/**
 * Public entry point for the `blueprintjs-react-table` package.
 *
 * Exports the `BP_Table` component and all public types used in its props,
 * the `withPagination` HOC that layers row pagination on top of `BP_Table`,
 * as well as the region / focus / selection types used by the focus and
 * selection APIs.
 *
 * Importing the component does not inject any CSS. Include the compiled
 * stylesheet once in your app:
 *
 *   import 'blueprintjs-react-table/styles.css';
 */
import './styles/table/table.scss';

export { BP_Table } from './components/BP_Table.tsx';
export type { BP_TableProps } from './components/BP_Table.tsx';

export { withPagination } from './components/pagination/withPagination.tsx';
export type {
  BP_PaginatedTableProps,
  BP_PaginationOptions,
} from './components/pagination/withPagination.tsx';

export { TablePaginationBar } from './components/pagination/TablePaginationBar.tsx';
export type { TablePaginationBarProps } from './components/pagination/TablePaginationBar.tsx';

export {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
} from './components/pagination/constants.ts';

export { DEFAULT_BP_TABLE_FEATURES } from './hooks/use-bp-table-instance.ts';

export type {
  BP_BodyContextMenuRenderer,
  BP_MenuContext,
} from './components/common/menu-context.ts';

export * from './types.ts';
export * from './components/common/region.ts';
