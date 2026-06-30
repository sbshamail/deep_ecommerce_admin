"use client";
import { FC, useMemo, useState } from "react";

interface Props {
  tabs?: TableTabsType[];
}

import Table from "@/components/cui/table";
import useTableTabs from "@/components/cui/table/components/useTabsTable";
import TableHeaderAction from "@/components/cui/table/headerAction";
import { ColumnFilterType, TableTabsType } from "@/types/table_types";
const TabTable: FC<Props> = ({
  tabs = [
    {
      data: [],
      columns: [],
    },
  ],
}) => {
  const [activeTab, setActiveTab] = useState(0);
  //hooks tabs
  const {
    data,
    columns,
    rowId,
    actionMenuList,
    newActionMenu,
    total,
    expandable,
    multiExpandable,
    ExpandingContent,
  } = useTableTabs({
    tabs,
    activeTab,
  });
  // **start STATES
  //table fullscreen state
  const [fullScreen, setFullScreen] = useState(false);

  //selectedRows
  const [selectedRows, setSelectedRows] = useState<Record<string, unknown>[]>(
    [],
  );

  // filter
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [columnFilter, setColumnFilter] = useState<ColumnFilterType[]>([]);

  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(20);

  const paginationData = useMemo(() => {
    const skip = (currentPage - 1) * dataLimit;
    return data.slice(skip, skip + dataLimit);
  }, [data, currentPage, dataLimit]);

  // **end STATES

  // handle rendering table on action

  // header action left side
  const headerAction = () => {
    return (
      <TableHeaderAction
        data={data}
        columns={columns}
        removeSelection={() => {}}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        actionMenuList={actionMenuList}
        newActionMenu={newActionMenu}
      />
    );
  };

  return (
    <Table
      total={total}
      data={paginationData}
      columns={columns}
      rowId={rowId}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      expandable={expandable}
      multiExpandable={multiExpandable}
      ExpandingContent={ExpandingContent}
      showColumnFilter={true}
      //header
      header={{
        headerAction,
        dates: {
          fromDate,
          setFromDate,
          toDate,
          setToDate,
        },
        columnsFilter: {
          columnFilter,
          setColumnFilter,
        },
        globalFilters: {
          setGlobalFilter,
          globalFilter,
        },

        showFullScreen: {
          setFullScreen,
          fullScreen,
        },
      }}
      //pagination
      showPagination={true}
      pagination={{
        currentPage,
        setCurrentPage,
        dataLimit,
        setDataLimit,
      }}
      striped={true}
      tableWrapperClass="max-h-[calc(100vh-350px)] overflow-y-auto"
    />
  );
};

export default TabTable;
