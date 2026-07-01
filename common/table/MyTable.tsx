"use client";
import Table from "@/components/cui/table";
import { demoColumns, demoData } from "@/components/cui/table/demo/demo";

const MyTable = () => (
  <Table
    data={demoData}
    columns={demoColumns}
    striped
    showColumnFilter
    tableWrapperClass="max-h-[calc(100vh-350px)] overflow-y-auto"
  >
    <Table.Header className="flex flex-col gap-2 font-semibold p-2">
      <div className="flex items-center justify-between">
        <Table.Dates />
        <div className="flex items-center gap-1">
          <Table.Search />
          <Table.ColumnFilter />
          <Table.FullScreen />
        </div>
      </div>
      <Table.FilterBadges />
    </Table.Header>
    <Table.Body />
    <Table.Pagination />
  </Table>
);

export default MyTable;
