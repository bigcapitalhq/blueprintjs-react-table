# blueprintjs-react-table

A Blueprint.js-styled data table for React, built on [TanStack Table v9](https://tanstack.com/table) with row virtualization from [TanStack Virtual](https://tanstack.com/virtual) and the look-and-feel of [Blueprint.js v6](https://blueprintjs.com/).

`BP_Table` recreates the classic Blueprint `<Table>` experience — a quadrant layout with frozen column and row headers, drag-to-reorder columns, sort menus, keyboard-driven focus and selection, and drag-to-resize rows — while keeping the full power of TanStack Table's headless API for data, columns, and state management. A Storybook is included to demo every feature.

## Features

### Layout & styling

- **Quadrant layout** — frozen column headers, row headers, and a scrollable body, rendered with Blueprint table styles.
- **Blueprint.js v6 skin** — cells, headers, selection overlays, and resize/reorder guides all use Blueprint colors and classes, so the table fits naturally into existing Blueprint apps.
- **Grouped column headers** — nested column definitions render on additional header rows; each group spans its child columns.
- **Ghost cells** — when the content is smaller than the viewport, leftover space is filled with empty cells (body, column headers, and row headers) instead of a blank background, and scrolling is disabled on the filled axes (`enableGhostCells`).

### Interactivity

- **Column reordering** — drag column headers to reorder columns (`enableColumnReordering`).
- **Column resizing** — drag the resize handle on header cells (TanStack's `column.getResizeHandler()`).
- **Sorting** — hover a column header and use the chevron menu for *Sort Asc* / *Sort Desc* / *Clear Sort* (`enableSorting`); controlled or uncontrolled via `state.sorting` / `onSortingChange`.
- **Focused cell & keyboard navigation** — click a cell to focus it; arrow keys move focus, Shift+arrows extend the selection, and Cmd/Ctrl+A selects everything (`enableFocusedCell`).
- **Region selection** — select cells by dragging, or full rows / columns / the whole table from the headers and corner menu; controlled or uncontrolled (`selectedRegions` / `onSelection`, `selectionModes`).
- **Row resizing** — drag the horizontal handle at the bottom of a row header (`enableRowResizing`); controlled or uncontrolled, with configurable min/max heights.
- **Column visibility** — hide/show columns via the controlled `columnVisibility` prop or TanStack's standard state/`enableHiding` options.

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
# Install dependencies
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
import { BP_Table } from './components/BP_Table';
import { createColumnHelper } from '@tanstack/react-table';
import type { BP_TableFeatures } from './types';

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
| `focusedCell` / `onFocusedCell` | `FocusedCellCoordinates` / callback | — | Controlled focused cell. |
| `onFocusedRegion` | `(region) => void` | — | Fires when the focused region changes. |
| `selectedRegions` / `onSelection` | `Region[]` / callback | — | Controlled region selection. |
| `selectionModes` | `RegionCardinality[]` | all | Restricts which selection types are allowed (cells, rows, columns, table). |
| `enableRowVirtualization` | `boolean` | `false` | Render only visible rows (plus overscan) — scales to very large data sets. |
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
| `Sorting` | Header chevron menu with Sort Asc / Sort Desc / Clear Sort. |
| `ControlledSorting` | Sorting state owned by the caller via `state` / `onSortingChange`. |
| `RowVirtualization` | 10,000 rows with only visible rows rendered. |
| `ColumnVisibility` | Controlled column visibility with `enableHiding: false` support. |
| `RowResizing` | Uncontrolled row resizing with `defaultRowHeights`. |
| `ControlledRowResizing` | Row heights owned by the caller via `rowHeights` / `onRowHeightChanged`. |
| `EditableCells` | Custom cell renderers (Blueprint `InputGroup`, `Checkbox`, `Tag`) with `meta.bodyCellClassName` styling. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server. |
| `npm run build` | Type-check and build the production bundle. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |
| `npm run storybook` | Start Storybook on port 6006. |
| `npm run build-storybook` | Build a static Storybook site. |

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

> **Note:** this repository is a private component library and demo (`private: true`, unpublished). `BP_Table` lives in `src/components/BP_Table.tsx` and is the single source of truth for the public API documented above.
