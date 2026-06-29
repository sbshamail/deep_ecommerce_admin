"use client";
import Table from "@/components/cui/table";
import { demoColumns, demoData } from "@/components/cui/table/demo/demo";
import { useMemo, useState } from "react";
const Page = () => {
  //table fullscreen state
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<
    Record<string, unknown>[] | []
  >([]);
  const [fromDate, setFromDate] = useState<Date | undefined>();
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [globalFilter, setGlobalFilter] = useState<string>("");
  //pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [dataLimit, setDataLimit] = useState(20);

  const paginationData = useMemo(() => {
    const skip = (currentPage - 1) * dataLimit;
    return demoData.slice(skip, skip + dataLimit);
  }, [currentPage, dataLimit]);

  const removeSelection = () => {
    setSelectedRows([]);
  };
  return (
    <div>
      <Table
        total={demoData.length}
        striped={true}
        data={paginationData}
        columns={demoColumns}
        selectedRows={selectedRows}
        setSelectedRows={setSelectedRows}
        showPagination={true}
        tableWrapperClass={
          !fullScreen ? "!max-h-[calc(100vh-350px)] overflow-y-auto" : ""
        }
        header={{
          dates: {
            fromDate,
            setFromDate,
            toDate,
            setToDate,
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
        pagination={{
          currentPage,
          setCurrentPage,
          dataLimit,
          setDataLimit,
        }}
      />
    </div>
  );
};

export default Page;
