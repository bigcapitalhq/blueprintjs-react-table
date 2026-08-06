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
