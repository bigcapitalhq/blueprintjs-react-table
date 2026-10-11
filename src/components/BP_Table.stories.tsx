import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentType } from 'react';
import {
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { Checkbox } from '@blueprintjs/core';
import { BP_Table, type BP_TableProps } from './BP_Table';
import {
  TableLoadingOption,
  type BP_TableFeatures,
  type BP_VisibilityState,
} from '../types.ts';
import './BP_Table.stories.css';

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

const groupedColumns = helper.columns([
  helper.group({
    id: 'identity',
    header: 'Identity',
    columns: helper.columns([
      helper.accessor('id', { header: 'ID' }),
      helper.accessor('name', { header: 'Name' }),
    ]),
  }),
  helper.group({
    id: 'profile',
    header: 'Profile',
    columns: helper.columns([
      helper.accessor('age', { header: 'Age' }),
      helper.accessor('role', { header: 'Role' }),
    ]),
  }),
]);

const meta = {
  title: 'BP_Table/Basic',
  component: BP_Table as ComponentType<BP_TableProps<Person>>,
} satisfies Meta<ComponentType<BP_TableProps<Person>>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    data,
    columns,
    enableColumnReordering: true,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
      </div>
    ),
  ],
};

export const ColumnGroups: Story = {
  args: {
    data,
    columns: groupedColumns,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Nested columns render on a second header row. Each group header spans the width of its
          child columns; resizing still operates on the leaf columns.
        </p>
      </div>
    ),
  ],
};

export const Loading: Story = {
  args: {
    data,
    columns,
    enableColumnReordering: true,
    loadingOptions: [
      TableLoadingOption.CELLS,
      TableLoadingOption.COLUMN_HEADERS,
      TableLoadingOption.ROW_HEADERS,
    ],
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
      </div>
    ),
  ],
};

export const FocusSelection: Story = {
  args: {
    data,
    columns,
    enableColumnReordering: true,
    enableFocusedCell: true,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Click a cell to focus/select. Drag to select a range. Click row/column headers or the
          corner menu to select rows/columns/all. Arrow keys move focus; Shift+arrows resize
          selection; Cmd/Ctrl+A selects all.
        </p>
      </div>
    ),
  ],
};

export const Sorting: Story = {
  args: {
    data,
    columns,
    enableColumnReordering: true,
    enableSorting: true,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Hover a column header and click the chevron to open the sort menu. Pick Sort Asc/Desc to
          reorder rows, or Clear Sort to remove the current sort.
        </p>
      </div>
    ),
  ],
};

export const ControlledSorting: Story = {
  args: {
    data,
    columns,
    enableColumnReordering: true,
    enableSorting: true,
  },
  render: () => {
    function ControlledSortingTable() {
      const [sorting, setSorting] = useState<SortingState>([]);
      return (
        <div className="bp-table-demo-wrapper">
          <BP_Table
            data={data}
            columns={columns}
            enableColumnReordering={true}
            enableSorting={true}
            state={{ sorting }}
            onSortingChange={setSorting}
          />
          <p className="bp-table-demo-hint">
            Sorting state is owned by the caller: currently{' '}
            {sorting.length === 0
              ? 'unsorted'
              : sorting.map((s) => `${s.id} (${s.desc ? 'desc' : 'asc'})`).join(', ')}.
          </p>
        </div>
      );
    }
    return <ControlledSortingTable />;
  },
};

const virtualizedData: Person[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  age: 20 + (index % 60),
  role: ['Engineer', 'Designer', 'Manager', 'Analyst'][index % 4],
}));

export const RowVirtualization: Story = {
  args: {
    data: virtualizedData,
    columns,
    enableColumnReordering: true,
    enableFocusedCell: true,
    enableRowVirtualization: true,
    overscanRowCount: 10,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Renders only the visible rows (plus overscan) out of 10,000. Scrolling, focus, and
          selection still operate on the full data set.
        </p>
      </div>
    ),
  ],
};

export const ColumnVisibility: Story = {
  args: {
    data,
    columns,
  },
  render: () => {
    // Local column defs so the non-hideable ID column doesn't leak into the
    // other stories.
    const visibilityColumns = helper.columns([
      helper.accessor('id', { header: 'ID', enableHiding: false }),
      helper.accessor('name', { header: 'Name' }),
      helper.accessor('age', { header: 'Age' }),
      helper.accessor('role', { header: 'Role' }),
    ]);
    const hideableColumnIds = ['name', 'age', 'role'];

    function ColumnVisibilityTable() {
      const [columnVisibility, setColumnVisibility] = useState<BP_VisibilityState>({});

      const isVisible = (columnId: string) => columnVisibility[columnId] ?? true;
      const allVisible = hideableColumnIds.every(isVisible);

      const toggleColumn = (columnId: string) => {
        setColumnVisibility((prev) => ({ ...prev, [columnId]: !(prev[columnId] ?? true) }));
      };

      const toggleAll = () => {
        setColumnVisibility(
          allVisible
            ? Object.fromEntries(hideableColumnIds.map((id) => [id, false] as const))
            : {},
        );
      };

      return (
        <div className="bp-table-demo-wrapper">
          <div className="bp-table-demo-toolbar">
            <Checkbox label="Toggle all" checked={allVisible} onChange={toggleAll} />
            <Checkbox label="ID" checked={isVisible('id')} disabled />
            <Checkbox label="Name" checked={isVisible('name')} onChange={() => toggleColumn('name')} />
            <Checkbox label="Age" checked={isVisible('age')} onChange={() => toggleColumn('age')} />
            <Checkbox label="Role" checked={isVisible('role')} onChange={() => toggleColumn('role')} />
          </div>
          <BP_Table
            data={data}
            columns={visibilityColumns}
            columnVisibility={columnVisibility}
            onColumnVisibilityChange={setColumnVisibility}
          />
          <p className="bp-table-demo-hint">
            Column visibility is fully controlled from outside the table: the checkboxes update the{' '}
            <code>columnVisibility</code> prop via <code>onColumnVisibilityChange</code>. The ID
            column defines <code>enableHiding: false</code>, so its checkbox is disabled and never
            hidden.
          </p>
        </div>
      );
    }

    return <ColumnVisibilityTable />;
  },
};
