import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentType } from 'react';
import {
  createColumnHelper,
  type SortingState,
} from '@tanstack/react-table';
import { BP_Table, type BP_TableProps } from './BP_Table';
import { TableLoadingOption, type BP_TableFeatures } from '../types.ts';
import './BP_Table.stories.css';

type Person = {
  id: number;
  name: string;
  age: number;
  role: string;
  email: string;
  department: string;
  location: string;
  salary: number;
  joinedAt: string;
  manager: string;
};

const helper = createColumnHelper<BP_TableFeatures, Person>();

const columns = helper.columns([
  helper.accessor('id', { header: 'ID' }),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
  helper.accessor('role', { header: 'Role' }),
]);

const wideColumns = helper.columns([
  helper.accessor('id', { header: 'ID' }),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('age', { header: 'Age' }),
  helper.accessor('role', { header: 'Role' }),
  helper.accessor('email', { header: 'Email' }),
  helper.accessor('department', { header: 'Department' }),
  helper.accessor('location', { header: 'Location' }),
  helper.accessor('salary', { header: 'Salary' }),
  helper.accessor('joinedAt', { header: 'Joined' }),
  helper.accessor('manager', { header: 'Manager' }),
]);

const data: Person[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    age: 36,
    role: 'Mathematician',
    email: 'ada@example.com',
    department: 'Engineering',
    location: 'London',
    salary: 120000,
    joinedAt: '2018-03-15',
    manager: 'Jordan Lee',
  },
  {
    id: 2,
    name: 'Alan Turing',
    age: 41,
    role: 'Computer Scientist',
    email: 'alan@example.com',
    department: 'Research',
    location: 'Manchester',
    salary: 110000,
    joinedAt: '2016-07-01',
    manager: 'Priya Sharma',
  },
  {
    id: 3,
    name: 'Grace Hopper',
    age: 85,
    role: 'Admiral',
    email: 'grace@example.com',
    department: 'Operations',
    location: 'Arlington',
    salary: 140000,
    joinedAt: '2013-11-20',
    manager: 'Chris Wong',
  },
];

const departments = ['Engineering', 'Design', 'Finance', 'Operations', 'People'];
const locations = ['London', 'New York', 'Seattle', 'Berlin', 'Tokyo', 'Sydney'];
const managers = ['Jordan Lee', 'Priya Sharma', 'Chris Wong', 'Ana Silva', 'Mohamed Ali'];

const frozenData: Person[] = Array.from({ length: 60 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  age: 20 + (index % 50),
  role: ['Engineer', 'Designer', 'Manager', 'Analyst'][index % 4],
  email: `person${index + 1}@example.com`,
  department: departments[index % departments.length],
  location: locations[index % locations.length],
  salary: 50_000 + index * 1_750,
  joinedAt: `20${18 + (index % 8)}-0${1 + (index % 9)}-15`,
  manager: managers[index % managers.length],
}));

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
  email: `person${index + 1}@example.com`,
  department: departments[index % departments.length],
  location: locations[index % locations.length],
  salary: 50_000 + (index % 500) * 100,
  joinedAt: `20${18 + (index % 8)}-0${1 + (index % 9)}-15`,
  manager: managers[index % managers.length],
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

export const FrozenColumns: Story = {
  args: {
    data: frozenData,
    columns: wideColumns,
    enableColumnReordering: true,
    enableFocusedCell: true,
    numFrozenColumns: 2,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          The two leftmost columns (ID, Name) are frozen in place; the remaining eight columns
          scroll horizontally beneath the pinned column header.
        </p>
      </div>
    ),
  ],
};

export const FrozenRows: Story = {
  args: {
    data: frozenData,
    columns: wideColumns,
    enableColumnReordering: true,
    enableFocusedCell: true,
    numFrozenRows: 3,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          The three topmost rows are frozen in place; the remaining 57 rows scroll vertically
          beneath the pinned column header.
        </p>
      </div>
    ),
  ],
};

export const FrozenColumnsAndRows: Story = {
  args: {
    data: frozenData,
    columns: wideColumns,
    enableColumnReordering: true,
    enableFocusedCell: true,
    numFrozenColumns: 2,
    numFrozenRows: 3,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Both the two leftmost columns and three topmost rows are frozen, so the top-left corner
          stays fixed while the rest of the table scrolls in both directions.
        </p>
      </div>
    ),
  ],
};

export const FrozenWithVirtualization: Story = {
  args: {
    data: virtualizedData,
    columns: wideColumns,
    enableColumnReordering: true,
    enableFocusedCell: true,
    enableRowVirtualization: true,
    overscanRowCount: 10,
    numFrozenColumns: 2,
    numFrozenRows: 3,
  },
  decorators: [
    (Story) => (
      <div className="bp-table-demo-wrapper">
        <Story />
        <p className="bp-table-demo-hint">
          Frozen rows and columns stay pinned while only the visible (non-frozen) rows are
          virtualized out of 10,000.
        </p>
      </div>
    ),
  ],
};
