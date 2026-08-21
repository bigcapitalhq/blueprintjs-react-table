import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentType } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { BP_Table, type BP_TableProps } from './BP_Table';
import { TableLoadingOption, type BP_TableFeatures } from '../types.ts';
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
