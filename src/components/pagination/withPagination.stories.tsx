import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ComponentType } from 'react';
import { createColumnHelper, type PaginationState } from '@tanstack/react-table';
import { BP_Table } from '../BP_Table';
import type { BP_TableFeatures } from '../../types.ts';
import { withPagination, type BP_PaginatedTableProps } from './withPagination.tsx';
import '../BP_Table.stories.css';

type Person = {
  id: number;
  name: string;
  age: number;
  role: string;
};

const helper = createColumnHelper<BP_TableFeatures, Person>();

const columns = helper.columns([
  helper.accessor('id', { header: 'ID', size: 80 }),
  helper.accessor('name', { header: 'Name', size: 200 }),
  helper.accessor('age', { header: 'Age', size: 100 }),
  helper.accessor('role', { header: 'Role', size: 200 }),
]);

const roles = ['Mathematician', 'Computer Scientist', 'Admiral', 'Engineer', 'Physicist'];

const data: Person[] = Array.from({ length: 240 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  age: 20 + (index % 60),
  role: roles[index % roles.length],
}));

const PaginatedTable = withPagination<Person>(BP_Table);

const meta = {
  title: 'BP_Table/Pagination',
  component: PaginatedTable as ComponentType<BP_PaginatedTableProps<Person>>,
} satisfies Meta<ComponentType<BP_PaginatedTableProps<Person>>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ClientSide: Story = {
  args: {
    data,
    columns,
  },
  render: () => (
    <div className="bp-table-demo-wrapper">
      <PaginatedTable
        data={data}
        columns={columns}
        enableSorting={true}
        enableRowResizing={true}
        initialPageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />
      <p className="bp-table-demo-hint">
        Pagination is added entirely by the <code>withPagination</code> HOC: the TanStack pagination
        feature, the page state, and the bar below the table. Sort a column to see the table reset
        to the first page. Row numbers, striping, and selection are page-local — each page numbers
        its rows starting at 1.
      </p>
    </div>
  ),
};

const virtualizedData: Person[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: index + 1,
  name: `Person ${index + 1}`,
  age: 20 + (index % 60),
  role: roles[index % roles.length],
}));

export const WithVirtualization: Story = {
  args: {
    data,
    columns,
  },
  render: () => (
    <div className="bp-table-demo-wrapper">
      <PaginatedTable
        data={virtualizedData}
        columns={columns}
        enableRowVirtualization={true}
        initialPageSize={100}
        overscanRowCount={10}
        enableFocusedCell={true}
      />
      <p className="bp-table-demo-hint">
        Pagination composes with row virtualization: the virtualizer only measures the current
        page, so 100 of the 10,000 rows are paged in while only the visible ones (plus overscan)
        are rendered.
      </p>
    </div>
  ),
};

export const ManualPagination: Story = {
  args: {
    data,
    columns,
  },
  render: () => {
    // The "server" only ever hands the table the current page of rows, and the
    // pagination state is owned by the story to simulate fetching per page.
    const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
    const pageRows = data.slice(
      pagination.pageIndex * pagination.pageSize,
      (pagination.pageIndex + 1) * pagination.pageSize,
    );

    return (
      <div className="bp-table-demo-wrapper">
        <PaginatedTable
          data={pageRows}
          columns={columns}
          manualPagination={true}
          pageCount={Math.ceil(data.length / pagination.pageSize)}
          rowCount={data.length}
          state={{ pagination }}
          onPaginationChange={setPagination}
        />
        <p className="bp-table-demo-hint">
          Server-side (manual) pagination: the table paginates nothing itself and receives only the
          current page of rows, while <code>pageCount</code> / <code>rowCount</code> drive the bar
          and the controlled <code>state.pagination</code> mirrors what a fetch would own.
        </p>
      </div>
    );
  },
};
