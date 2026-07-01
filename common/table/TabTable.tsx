"use client";
import Table from "@/components/cui/table";
import { TableTabsType } from "@/types/table_types";
import { FC } from "react";

interface Props {
  tabs?: TableTabsType[];
}

const TabTable: FC<Props> = ({ tabs = [{ data: [], columns: [] }] }) => (
  <Table
    tabs={tabs}
    striped
    showColumnFilter
    tableWrapperClass="max-h-[calc(100vh-350px)] overflow-y-auto"
  >
    <Table.Header className="flex flex-col gap-2 font-semibold p-1">
      <div className="flex items-center justify-between">
        <Table.Dates />
        <div className="flex items-center gap-1">
          <Table.Search />
          <Table.ColumnFilter />
          <Table.Density />
          <Table.FullScreen iconSize={16} />
        </div>
      </div>
      <Table.Action />
      <Table.FilterBadges />
    </Table.Header>
    <Table.Tabs className="py-0.5" />
    <Table.Pagination />
  </Table>
);

export default TabTable;
