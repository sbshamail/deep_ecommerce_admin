import { JSX } from "react";

// component
import { ColumnType } from "@/types/table_types";
import { hasObjectValues } from "@/utility/helpers";
import FullScreenTable, {
  FullScreenTableType,
} from "../components/FullScreenTable";
import FromToDateFilter, {
  FromToDateFilterTypes,
} from "../filters/FromToDateFilter";
import GlobalFilter, { GlobalFilterType } from "../filters/GlobalFilter";

export interface HeaderType {
  headerAction?: () => JSX.Element;
  dates?: FromToDateFilterTypes;
  globalFilters?: GlobalFilterType;

  showFullScreen?: FullScreenTableType;
}

interface Props extends HeaderType {
  columns: ColumnType[];
}
const TableHeader = ({
  dates,
  headerAction,
  globalFilters,
  columns,

  showFullScreen,
}: Props) => {
  const { fromDate, setFromDate, toDate, setToDate } = dates || {};

  const { setGlobalFilter, globalFilter } = globalFilters || {};

  return (
    <div>
      <div className=" flex flex-col font-semibold">
        <div className="flex items-center justify-between">
          {dates && hasObjectValues(dates) && setFromDate && setToDate && (
            <FromToDateFilter
              fromDate={fromDate}
              setFromDate={setFromDate}
              toDate={toDate}
              setToDate={setToDate}
            />
          )}
          <div className="flex items-center space-x-2">
            {setGlobalFilter && (
              <GlobalFilter
                setGlobalFilter={setGlobalFilter}
                globalFilter={globalFilter}
              />
            )}

            {showFullScreen && (
              <FullScreenTable
                fullScreen={showFullScreen?.fullScreen}
                setFullScreen={showFullScreen?.setFullScreen}
              />
            )}
          </div>
        </div>
        {headerAction && <div className="">{headerAction()}</div>}
      </div>
    </div>
  );
};

export default TableHeader;
