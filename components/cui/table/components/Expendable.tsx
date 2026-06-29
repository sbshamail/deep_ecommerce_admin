import { ColumnType, ExpandingTableType } from "@/types/table_types";
import { ChevronDown, ChevronRight } from "lucide-react";

interface ExtendableArrowType {
  setSelectAll: (bool: boolean) => void;
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  openExpandableRow: number | number[];
  index: number;
  setOpenExpandableRow: (index: number | number[]) => void;
  multiExpandable?: boolean;
}
export const ExtendableArrow = ({
  setSelectAll,
  setSelectedRows,
  openExpandableRow,
  setOpenExpandableRow,
  index,
  multiExpandable,
}: ExtendableArrowType) => {
  const handleExpandRow = (index: number) => {
    setSelectAll(false);
    setSelectedRows([]);

    const toggleSingleExpand = () => {
      setOpenExpandableRow(index === openExpandableRow ? -1 : index);
    };
    const toggleMultiExpand = () => {
      if (
        Array.isArray(openExpandableRow) &&
        openExpandableRow.includes(index)
      ) {
        setOpenExpandableRow(openExpandableRow.filter((v) => v !== index));
        return;
      }

      setOpenExpandableRow(
        Array.isArray(openExpandableRow)
          ? [...openExpandableRow, index]
          : [index],
      );
    };

    if (multiExpandable) {
      toggleMultiExpand();
    } else {
      toggleSingleExpand();
    }
  };
  // console.log(isExpandable(openExpandableRow, index, multiExpandable));
  return (
    <td className="relative h-0 cursor-pointer">
      <span className="" onClick={() => handleExpandRow(index)}>
        {isExpandable(openExpandableRow, index, multiExpandable) ? (
          <ChevronDown />
        ) : (
          <ChevronRight />
        )}
      </span>
    </td>
  );
};

interface ExtentableContentType {
  item: Record<string, unknown>;
  data: Record<string, unknown>[];
  index: number;
  columns: ColumnType[];
  ExpandingContent?: ExpandingTableType;
  expandableWidth?: string | number;
}
export const ExtentableContent = ({
  item,
  data,
  index,
  columns,
  expandableWidth,
  ExpandingContent,
}: ExtentableContentType) => {
  return (
    <tr className="" key={index}>
      <td colSpan={columns.length + 2}>
        <div
          style={{
            width: `${expandableWidth}px`,
          }}
        >
          {/* <div>adasdasd</div> */}
          {ExpandingContent && ExpandingContent({ row: item, index, data })}
        </div>
      </td>
    </tr>
  );
};

export const isExpandable = (
  openExpandableRow: number | number[],
  index: number,
  multiExpandable?: boolean,
  expandingContent?: unknown,
) => {
  return multiExpandable
    ? Array.isArray(openExpandableRow) && openExpandableRow.includes(index)
    : openExpandableRow === index;
};
