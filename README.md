# blueprintjs-react-table

A Blueprint.js-styled data table for React, built on [TanStack Table v9](https://tanstack.com/table) with row virtualization from [TanStack Virtual](https://tanstack.com/virtual) and the look-and-feel of [Blueprint.js v6](https://blueprintjs.com/).

`BP_Table` recreates the classic Blueprint `<Table>` experience — a quadrant layout with frozen column and row headers, drag-to-reorder columns, sort menus, keyboard-driven focus and selection, and drag-to-resize rows — while keeping the full power of TanStack Table's headless API for data, columns, and state management. A Storybook is included to demo every feature.

## Features

### Layout & styling

- **Quadrant layout** — frozen column headers, row headers, and a scrollable body, rendered with Blueprint table styles.
- **Frozen columns & rows** — freeze the leftmost columns (`numFrozenColumns`) and topmost rows (`numFrozenRows`) in place while the rest of the body scrolls, mirroring Blueprint's frozen areas. The column headers and row headers are always frozen, and frozen areas stay correct across column reordering, column visibility, and sorting.
- **Blueprint.js v6 skin** — cells, headers, selection overlays, and resize/reorder guides all use Blueprint colors and classes, so the table fits naturally into existing Blueprint apps.
- **Grouped column headers** — nested column definitions render on additional header rows; each group spans its child columns.
- **Ghost cells** — when the content is smaller than the viewport, leftover space is filled with empty cells (body, column headers, and row headers) instead of a blank background, and scrolling is disabled on the filled axes (`enableGhostCells`).

### Interactivity

- **Column reordering** — drag column headers to reorder columns (`enableColumnReordering`).
- **Column resizing** — drag the resize handle on header cells (TanStack's `column.getResizeHandler()`).
- **Sorting** — hover a column header and use the chevron menu for *Sort Asc* / *Sort Desc* / *Clear Sort* (`enableSorting`); controlled or uncontrolled via `state.sorting` / `onSortingChange`.
- **Focused cell & keyboard navigation** — click a cell to focus it; arrow keys move focus, Shift+arrows extend the selection, and Cmd/Ctrl+A selects everything (`enableFocusedCell`).
- **Region selection** — select cells by dragging, or full rows / columns / the whole table from the headers and corner menu; controlled or uncontrolled (`selectedRegions` / `onSelection`, `selectionModes`).
- **Body context menu** — right-click a cell to open a custom Blueprint `Menu` (`bodyContextMenuRenderer`). A right-click outside the current selection selects the clicked cell first, and the renderer receives the selection (or the clicked cell) as a `BP_MenuContext` that also exposes the TanStack row and cell under the cursor.
- **Row resizing** — drag the horizontal handle at the bottom of a row header (`enableRowResizing`); controlled or uncontrolled, with configurable min/max heights.
- **Column visibility** — hide/show columns via the controlled `columnVisibility` prop or TanStack's standard state/`enableHiding` options.
- **Pagination (HOC)** — the `withPagination` higher-order component adds TanStack row pagination and a Blueprint-styled bar below any table component, keeping pagination out of the core table; client-side or manual/server-side (`manualPagination` + `pageCount` / `rowCount`).

### Performance & data

- **Row virtualization** — only the visible rows (plus an overscan buffer) are rendered, so the table scales to tens of thousands of rows (`enableRowVirtualization`, `overscanRowCount`).
- **Full TanStack Table v9 option pass-through** — `columns`, `data`, `state`, `on*Change` callbacks, and every other table option are forwarded to `useReactTable`.
- **Loading skeletons** — render skeleton placeholders in the cells, column headers, and/or row headers (`loadingOptions`).
- **Column `meta` classnames** — style individual columns' body and header cells via `meta.bodyCellClassName` / `meta.headCellClassName`.

## Requirements

- Node.js 18+
- React 18

## Getting started

```bash
npm install blueprintjs-react-table
```

The table renders with Blueprint's visual language, so your app must already
be styled with Blueprint and have React 18 installed:

```bash
npm install @blueprintjs/core @blueprintjs/icons react react-dom @tanstack/react-table @tanstack/react-virtual
```

Import the compiled table styles once, alongside Blueprint's own styles (if
you don't already import them):

```tsx
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import 'blueprintjs-react-table/styles.css';

import { BP_Table } from 'blueprintjs-react-table';
```

```bash
# For developing this library:
npm install

# Run the Storybook with live demos of every feature
npm run storybook

# Run the bare Vite dev app
npm run dev
```

Storybook is the primary way to explore the component: it contains stories for the basic table, column groups, loading states, ghost cells, focus & selection, sorting (controlled and uncontrolled), virtualization with 10,000 rows, column visibility, row resizing (controlled and uncontrolled), and editable cells.

## Basic usage

`BP_Table` is a thin wrapper around TanStack Table: you define columns with `createColumnHelper` and pass `data` + `columns` in, exactly like any TanStack table.

```tsx
import { BP_Table } from 'blueprintjs-react-table';
import { createColumnHelper } from '@tanstack/react-table';
import type { BP_TableFeatures } from 'blueprintjs-react-table';

type Person = {
  id: number;
  name: string;
  age: number;
  role: string;
};

const helper = createColumnHelper<BP_TableFeatures, Person>();

const columns = helper.columns([
  helper.accessor('id', { header: 'ID' }),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
  helper.accessor('role', { header: 'Role' }),
]);

const data: Person[] = [
  { id: 1, name: 'Ada Lovelace', age: 36, role: 'Mathematician' },
  { id: 2, name: 'Alan Turing', age: 41, role: 'Computer Scientist' },
  { id: 3, name: 'Grace Hopper', age: 85, role: 'Admiral' },
];

export function PeopleTable() {
  return <BP_Table data={data} columns={columns} />;
}
```

Enable Blueprint-style interactions with a few flags:

```tsx
<BP_Table
  data={data}
  columns={columns}
  enableColumnReordering
  enableSorting
  enableFocusedCell
  enableRowResizing
/>
```

Freeze the leading columns and rows (the column and row headers are always frozen):

```tsx
<BP_Table
  data={data}
  columns={columns}
  numFrozenColumns={2}
  numFrozenRows={1}
  enableRowVirtualization
/>
```

`numFrozenColumns` and `numFrozenRows` are derived from the table's current state: the frozen
columns are the first N visible columns of the current column order (hiding a column shifts the
frozen set, and dropping a column inside the frozen area freezes it), and the frozen rows are the
first N rows of the current row model (so they follow sorting). Power users can also drive the
regions directly through TanStack's `columnPinning` / `rowPinning` state and `column.pin()`.

State can be controlled from outside the table through the standard TanStack props:

```tsx
const [sorting, setSorting] = useState<SortingState>([]);

<BP_Table
  data={data}
  columns={columns}
  enableSorting
  state={{ sorting }}
  onSortingChange={setSorting}
/>;
```

Right-click context menus are customized with a renderer that receives the
Blueprint-style `BP_MenuContext` (the equivalent of Blueprint's `MenuContext`)
and returns the menu to show:

```tsx
import { Menu, MenuItem } from '@blueprintjs/core';

<BP_Table
  data={data}
  columns={columns}
  bodyContextMenuRenderer={(context) => (
    <Menu>
      <MenuItem icon="trash" text={`Delete ${context.getTargetRow()?.original.name ?? 'row'}`} />
      <MenuItem icon="clipboard" text={`Copy ${context.getUniqueCells().length} cells`} />
    </Menu>
  )}
/>;
```

`getTarget()` / `getTargetRow()` / `getTargetCell()` report the right-clicked
cell, and `getRegions()` / `getSelectedRegions()` report the user-intended
regions: the current selection when the right-click landed inside it, otherwise
just the clicked cell. A right-click outside the current selection moves the
selection (and the focused cell, when `enableFocusedCell` is enabled) to the
clicked cell before the menu opens. Right-clicks that don't land on a body cell
(ghost cells, empty space) fall back to the browser's native context menu.
Pass `enableBodyContextMenu={false}` to disable the custom menu.

## Pagination (HOC)

Pagination is layered on top of `BP_Table` by the `withPagination` higher-order
component, so the core table stays pagination-free. The HOC registers TanStack's
row pagination feature, owns the page state, and renders a Blueprint-styled bar
below the table:

```tsx
import { BP_Table, withPagination } from 'blueprintjs-react-table';

const PaginatedTable = withPagination(BP_Table);

<PaginatedTable data={data} columns={columns} initialPageSize={20} />;
```

Pagination options (on top of every `BP_TableProps`):

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `initialPageSize` | `number` | `10` | Initial page size for uncontrolled pagination. |
| `initialPageIndex` | `number` | `0` | Initial zero-based page index for uncontrolled pagination. |
| `pageSizeOptions` | `readonly number[]` | `[10, 20, 50, 100]` | Page sizes offered by the bar's select. |
| `showPaginationBar` | `boolean` | `true` | Hide the bar while keeping the table paginated. |
| `paginationBarClassName` | `string` | — | Class name(s) for the pagination bar. |

Pagination becomes controlled when `state.pagination` is provided; pair it with
`onPaginationChange`:

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

<PaginatedTable
  data={data}
  columns={columns}
  state={{ pagination }}
  onPaginationChange={setPagination}
/>;
```

For server-side pagination, pass `manualPagination` plus `pageCount` (or
`rowCount`) and hand the table only the current page of rows; the table then
skips client-side slicing and the bar uses the supplied counts:

```tsx
<PaginatedTable
  data={currentPageRows}
  columns={columns}
  manualPagination
  pageCount={totalPageCount}
  rowCount={totalRowCount}
  state={{ pagination }}
  onPaginationChange={setPagination}
/>;
```

Notes:

- Pagination composes with sorting, row virtualization, frozen rows/columns,
  and row resizing. Sorting (or a `data` change) resets to the first page by
  default, per TanStack's `autoResetPageIndex`.
- Row numbers, ledger striping, row resizing, and selection/focus regions are
  **page-local**: each page numbers its rows starting at 1. When `selectedRegions`
  or `focusedCell` are controlled, reset them from `onPaginationChange` if they
  should not carry across pages.

## Core props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `data` / `columns` | TanStack `TableOptions` | — | Table data and column definitions (full TanStack option set is forwarded). |
| `rowHeight` | `number` | `20` | Height of each body row, in pixels. |
| `rowHeaderWidth` | `number` | `30` | Width of the frozen row-header column, in pixels. |
| `columnHeaderHeight` | `number` | `30` | Height of the frozen column-header row(s), in pixels. |
| `enableColumnReordering` | `boolean` | `false` | Drag column headers to reorder columns. |
| `enableSorting` | `boolean` | `false` | Chevron sort menu on sortable headers; also enables TanStack sorting. |
| `enableFocusedCell` | `boolean` | `false` | Focused cell with keyboard navigation and selection. |
| `enableGhostCells` | `boolean` | `false` | Fill leftover viewport space with empty cells (body, column headers, row headers) when the content doesn't overflow; scrolling is disabled on filled axes. |
| `bodyContextMenuRenderer` | `(context: BP_MenuContext<TData>) => ReactElement \| null \| undefined` | — | Render a custom context menu when right-clicking a body cell. |
| `enableBodyContextMenu` | `boolean` | `true` when a renderer is set | Whether the body context menu is enabled. |
| `focusedCell` / `onFocusedCell` | `FocusedCellCoordinates` / callback | — | Controlled focused cell. |
| `onFocusedRegion` | `(region) => void` | — | Fires when the focused region changes. |
| `selectedRegions` / `onSelection` | `Region[]` / callback | — | Controlled region selection. |
| `selectionModes` | `RegionCardinality[]` | all | Restricts which selection types are allowed (cells, rows, columns, table). |
| `enableRowVirtualization` | `boolean` | `false` | Render only visible rows (plus overscan) — scales to very large data sets. |
| `numFrozenColumns` | `number` | `0` | Freeze the leftmost N columns in place while the rest scroll; derived from the current column order and visibility. |
| `numFrozenRows` | `number` | `0` | Freeze the topmost N rows in place while the rest scroll; derived from the current row model (so it follows sorting). |
| `overscanRowCount` | `number` | `5` | Rows rendered above/below the viewport when virtualizing. |
| `columnVisibility` | `BP_VisibilityState` | — | Controlled column visibility (`true` = visible). Convenience alias for `state.columnVisibility`. |
| `enableRowResizing` | `boolean` | `false` | Drag the handle on a row header to resize that row. |
| `rowHeights` / `defaultRowHeights` | `Array<number \| undefined>` | — | Controlled / initial per-row heights; `undefined` falls back to `rowHeight`. |
| `onRowHeightChanged` | `(index, height) => void` | — | Fires continuously during a row-resize drag (and once when it ends). |
| `minRowHeight` / `maxRowHeight` | `number` | `6` / `100` | Clamps for row resizing. |
| `loadingOptions` | `TableLoadingOption[]` | `[]` | Renders skeleton placeholders: `CELLS`, `COLUMN_HEADERS`, `ROW_HEADERS`. |

## Storybook stories

| Story | What it demos |
| --- | --- |
| `Basic` | Minimal table with column reordering. |
| `ColumnGroups` | Nested column definitions on a second header row. |
| `Loading` | Skeleton placeholders in cells, column headers, and row headers. |
| `GhostCells` | Empty ghost cells fill leftover space when the table is smaller than its viewport. |
| `FocusSelection` | Click/drag selection, row/column/corner-header selection, arrow-key focus, Shift+arrows, Cmd/Ctrl+A. |
| `BodyContextMenu` | Right-click a cell for a custom Blueprint menu acting on the clicked cell or the current selection. |
| `Sorting` | Header chevron menu with Sort Asc / Sort Desc / Clear Sort. |
| `ControlledSorting` | Sorting state owned by the caller via `state` / `onSortingChange`. |
| `RowVirtualization` | 10,000 rows with only visible rows rendered. |
| `ColumnVisibility` | Controlled column visibility with `enableHiding: false` support. |
| `RowResizing` | Uncontrolled row resizing with `defaultRowHeights`. |
| `ControlledRowResizing` | Row heights owned by the caller via `rowHeights` / `onRowHeightChanged`. |
| `EditableCells` | Custom cell renderers (Blueprint `InputGroup`, `Checkbox`, `Tag`) with `meta.bodyCellClassName` styling. |
| `FrozenColumnsAndRows` | Frozen columns and rows with focus, selection, resizing, and cross-boundary reordering. |
| `FrozenColumnsVirtualized` | 10,000 rows with frozen columns/rows and row virtualization. |
| `FrozenColumnsWithGhostCells` | Ghost cells filling the leftover space around frozen rows/columns. |
| `Pagination/ClientSide` | `withPagination(BP_Table)` slicing 240 rows client-side, with sorting (resets to page 1) and page-size control. |
| `Pagination/WithVirtualization` | Paginated pages of a 10,000-row data set, virtualized within the current page. |
| `Pagination/ManualPagination` | Server-side pagination with `manualPagination`, `pageCount` / `rowCount`, and controlled state. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and build the publishable library (`dist/`: ESM + CJS bundles, `styles.css`, and `.d.ts` types). |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run storybook` | Start Storybook on port 6006. |
| `npm run build-storybook` | Build a static Storybook site. |

Publishing: `npm run build` runs automatically via `prepublishOnly` before
`npm publish`. The `dist/` directory is the only thing shipped in the npm
tarball.

## Tech stack & structure

- **React 18** + **TypeScript** + **Vite**
- [**@blueprintjs/core** v6](https://www.npmjs.com/package/@blueprintjs/core) — visual language, skins, and demo controls
- [**@tanstack/react-table** v9](https://www.npmjs.com/package/@tanstack/react-table) — headless table core
- [**@tanstack/react-virtual**](https://www.npmjs.com/package/@tanstack/react-virtual) — row virtualization
- **Storybook 8** — feature demos and development harness

```
src/
├── components/
│   ├── BP_Table.tsx            # Public component & props
│   ├── container/              # Scroll container and layout
│   ├── head/                   # Column headers, sort menu, reordering
│   ├── body/                   # Body cells, row headers, virtualization
│   ├── quadrant/               # Quadrant layout plumbing
│   ├── layers/                 # Resize/reorder guides and overlays
│   └── common/                 # Regions, dimensions, classes, contexts
├── hooks/                      # Focus/selection, reordering, resizing, virtualization
└── types.ts                    # Shared types (TableLoadingOption, BP_VisibilityState, …)
```

> `BP_Table` lives in `src/components/BP_Table.tsx` and is the single source of
> truth for the public API documented above; `src/index.ts` re-exports it as
> the package entry point.
