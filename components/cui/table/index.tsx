"use client";
import React, { JSX, useState } from "react";
import Pagination, { PaginationType } from "./main/Pagination";
import TableMainBody, { TableMainBodyTypes } from "./main/TableMainBody";

import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import FullScreenDom from "@/hooks/FullScreenDom";
import useDivDimensions from "@/hooks/useDivDimensions";
import { ColumnType, TableTabsType } from "@/types/table_types";
import TableHeader, { HeaderType } from "./main/TableHeader";
import TableTabs from "./main/TableTabs";

type ClassNameType = React.ComponentProps<"div">["className"];

interface TableProps extends TableMainBodyTypes {
  layoutClass?: ClassNameType;
  showPagination?: boolean;
  total?: number;
  pagination?: PaginationType;
  header?: HeaderType;
  tabs?: TableTabsType[];
  activeTab?: number;
  titleTable?: string | JSX.Element;
  setActiveTab?: (n: number) => void;
  showColumnFilter?: boolean;
}
const Table = ({
  layoutClass,
  header,
  pagination,
  showPagination = false,
  tabs,
  activeTab,
  setActiveTab,
  titleTable,

  //tableMain
  data,
  columns,
  total,
  rowId,
  selectedRows,
  setSelectedRows,
  showColumnFilter,
  expandable,
  multiExpandable,
  ExpandingContent,
  //styles
  striped,
  stripedClass,
  tableWrapperClass,
  // tables classes
  tableClass,
  trHeadClass,
  tHeadClass,
  thHeadClass,
  tableInsideClass,
  tBodyClass,
  trBodyClass,
  tdBodyClass,
}: TableProps) => {
  //hooks tabs

  const [showOnlyColumns, setShowOnlyColumns] = useState(columns);
  const [columnFilterField, setColumnFilterFields] = useState<ColumnType[]>([]);

  const fullScreen = header?.showFullScreen?.fullScreen ?? false;
  const { divRef: headerRef } = useDivDimensions(null, fullScreen);
  const { divRef: footerRef } = useDivDimensions(null, fullScreen);

  const tableMain = () => (
    <TableMainBody
      data={data}
      rowId={rowId}
      columns={showColumnFilter ? showOnlyColumns : columns}
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      expandable={expandable}
      multiExpandable={multiExpandable}
      ExpandingContent={ExpandingContent}
      striped={striped}
      stripedClass={stripedClass}
      tableWrapperClass={fullScreen ? "h-full overflow-y-auto" : tableWrapperClass}
      wrapperClass={fullScreen ? "h-full" : undefined}
      // tables classes
      tableClass={tableClass}
      trHeadClass={trHeadClass}
      tHeadClass={tHeadClass}
      thHeadClass={thHeadClass}
      tableInsideClass={tableInsideClass}
      tBodyClass={tBodyClass}
      trBodyClass={trBodyClass}
      tdBodyClass={tdBodyClass}
    />
  );
  return (
    <FullScreenDom open={fullScreen}>
      <div
        className={twMerge(
          clsx(
            "shadow-2xl shadow-border border border-border rounded-[20px] gap-2",
            fullScreen && "flex flex-col h-full rounded-none border-none shadow-none",
            layoutClass,
          ),
        )}
      >
        <div ref={headerRef} className={fullScreen ? "flex-none" : ""}>
          <TableHeader
            dates={header?.dates}
            globalFilters={header?.globalFilters}
            showColumnFilterFields={{
              columnFilterField,
              setColumnFilterFields,
            }}
            showFullScreen={header?.showFullScreen}
            showOnlyColumns={showColumnFilter ? showOnlyColumns : undefined}
            columnsFilter={header?.columnsFilter}
            setShowOnlyColumns={
              showColumnFilter ? setShowOnlyColumns : undefined
            }
            headerAction={header?.headerAction}
            columns={columns}
          />
        </div>
        <div className={fullScreen ? "flex-1 min-h-0 overflow-hidden" : ""}>
          <TableTabs
            tabs={tabs}
            tableMain={tableMain}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setSelectedRows={setSelectedRows}
            titleTable={titleTable}
            className={fullScreen ? "h-full flex flex-col" : undefined}
            contentClassName={fullScreen ? "flex-1 min-h-0" : undefined}
          />
        </div>
        {showPagination && pagination && (
          <div ref={footerRef} className={fullScreen ? "flex-none" : ""}>
            <Pagination
              currentPage={pagination.currentPage}
              setCurrentPage={pagination.setCurrentPage}
              dataLimit={pagination.dataLimit}
              setDataLimit={pagination.setDataLimit}
              total={total}
            />
          </div>
        )}
      </div>
    </FullScreenDom>
  );
};

export default Table;
