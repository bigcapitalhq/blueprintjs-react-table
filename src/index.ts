/**
 * Public entry point for the `blueprintjs-react-table` package.
 *
 * Exports the `BP_Table` component and all public types used in its props,
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

export type {
  BP_BodyContextMenuRenderer,
  BP_MenuContext,
} from './components/common/menu-context.ts';

export * from './types.ts';
export * from './components/common/region.ts';
