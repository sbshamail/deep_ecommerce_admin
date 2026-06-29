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
  //   const fullScreen = header?.showFullScreen?.fullScreen ?? false;
  const fullScreen = false;
  const { dimension: headerDimension, divRef: headerRef } = useDivDimensions(
    null,
    fullScreen,
  );
  const { dimension: footerDimension, divRef: footerRef } = useDivDimensions(
    null,
    fullScreen,
  );

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
      tableWrapperClass={tableWrapperClass}
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
    <FullScreenDom open={fullScreen} className="overflow-hidden">
      <div
        className={twMerge(
          clsx(
            { "p-4 py-10": !fullScreen }, // Apply when not fullScreen
            " shadow-2xl shadow-border border border-border rounded-[20px] gap-2 ",
            { "p-0 m-0 space-y-0": fullScreen }, // Apply when fullScreen
            layoutClass,
          ),
        )}
      >
        <div ref={headerRef}>
          <TableHeader
            dates={header?.dates}
            // columnsFilter={header?.columnsFilter}
            globalFilters={header?.globalFilters}
            // showColumnFilterFields={{
            //   columnFilterField,
            //   setColumnFilterFields,
            // }}
            showFullScreen={header?.showFullScreen}
            // showOnlyColumns={showColumnFilter ? showOnlyColumns : undefined}
            // setShowOnlyColumns={
            //   showColumnFilter ? setShowOnlyColumns : undefined
            // }
            headerAction={header?.headerAction}
            columns={columns}
          />
        </div>
        <div
          style={
            fullScreen && headerDimension && footerDimension
              ? {
                  height: `calc(100vh - ${headerDimension.height + footerDimension.height}px)`,
                  overflow: "auto",
                }
              : { overflow: "auto" }
          }
        >
          <div>
            <TableTabs
              tabs={tabs}
              tableMain={tableMain}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setSelectedRows={setSelectedRows}
              titleTable={titleTable}
            />
          </div>
        </div>

        {showPagination && pagination && (
          <div
            style={{ height: footerDimension?.height || "auto" }}
            ref={footerRef}
          >
            <Pagination
              currentPage={pagination?.currentPage}
              setCurrentPage={pagination?.setCurrentPage}
              dataLimit={pagination?.dataLimit}
              setDataLimit={pagination?.setDataLimit}
              total={total}
            />
          </div>
        )}
      </div>
    </FullScreenDom>
  );
};

export default Table;
