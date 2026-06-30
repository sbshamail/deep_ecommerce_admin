"use client";
import React, { useCallback, useState } from "react";

import { twMerge } from "tailwind-merge";

import { Checkbox } from "@/components/ui/checkbox";
import useDivDimensions from "@/hooks/useDivDimensions";
import { ClassNameType } from "@/types/common_types";
import {
  ColumnType,
  ExpandingTableType,
  TableMainClassesType,
} from "@/types/table_types";
import {
  ExtendableArrow,
  ExtentableContent,
  isExpandable,
} from "../components/Expendable";
import { renderCell } from "../components/renderCell";
import { ToggleRowSelection } from "../components/ToggleRowSelection";

export interface TableMainBodyTypes extends TableMainClassesType {
  data: Record<string, unknown>[];
  columns: ColumnType[];
  selectedRows?: Record<string, unknown>[];
  setSelectedRows?: (rows: Record<string, unknown>[]) => void;
  rowId?: "id" | "_id" | string;

  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType;
  //styles
  striped?: boolean;
  stripedClass?: ClassNameType;
  tableWrapperClass?: ClassNameType;
  wrapperClass?: ClassNameType;
}
const TableMainBody = ({
  data,
  columns,
  rowId = "id",
  selectedRows,
  setSelectedRows = () => {},
  expandable,
  multiExpandable,
  ExpandingContent,
  //style
  striped,
  stripedClass = "bg-accent",
  tableWrapperClass,
  wrapperClass,
  // tables classes
  tableClass,
  trHeadClass,
  tHeadClass,
  thHeadClass,
  tableInsideClass = "border border-card-foreground/10 shadow-sm shadow-accent text-[0.9em] text-left p-3",
  tBodyClass,
  trBodyClass,
  tdBodyClass,
}: TableMainBodyTypes) => {
  const [selectAll, setSelectAll] = useState(false);
  // expendable states

  const [openExpandableRow, setOpenExpandableRow] = useState<number | number[]>(
    [-1],
  );
  // ref width , this divRef is use for nested table width
  const { dimension, divRef } = useDivDimensions(["resize"]);

  const toggle = useCallback(() => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data);
    }
    setSelectAll(!selectAll);
  }, [selectAll, setSelectedRows, data]);

  const TableHead = () => (
    <thead className={twMerge(`border-none `, `${tHeadClass} `)}>
      <tr
        className={twMerge(`z-10  sticky top-0 bg-accent`, ` ${trHeadClass} `)}
      >
        {(expandable || multiExpandable) && (
          <th
            className={twMerge(
              `   select-none`,
              ` ${tableInsideClass}`,
              ` ${thHeadClass} w-10`,
            )}
          ></th>
        )}
        {selectedRows && (
          <th
            className={twMerge(
              `   ${tableInsideClass} select-none`,
              ` ${thHeadClass} w-10`,
            )}
          >
            <Checkbox onCheckedChange={toggle} checked={selectAll} />
          </th>
        )}
        {columns &&
          columns.length &&
          columns?.map((item, index) => {
            return (
              <th
                key={index}
                className={twMerge(
                  `   px-5 ${tableInsideClass} whitespace-nowrap`,
                  `  ${thHeadClass}`,
                )}
              >
                <span className="font-bold">{item?.title}</span>
              </th>
            );
          })}
      </tr>
    </thead>
  );
  const TableBody = () => (
    <tbody className={twMerge(`text-sm font-medium`, ` ${tBodyClass}`)}>
      {data?.map((item, index: number) => {
        return (
          <React.Fragment key={index}>
            <tr
              key={index}
              className={twMerge(
                `border-none hover:bg-accent ${striped && index % 2 !== 0 && stripedClass}`,
                `${trBodyClass}`,
              )}
            >
              {/* for expenadle td arrow show*/}

              {(expandable || multiExpandable) &&
                ExtendableArrow({
                  setOpenExpandableRow,
                  index,
                  openExpandableRow,
                  setSelectAll,
                  setSelectedRows,
                  multiExpandable,
                })}

              {/* for selection single td */}
              {selectedRows && setSelectedRows && (
                <td
                  className={twMerge(
                    `${tableInsideClass} `,
                    `  ${tdBodyClass} `,
                  )}
                >
                  {ToggleRowSelection(
                    item,
                    rowId,
                    selectedRows,
                    setSelectedRows,
                  )}
                </td>
              )}

              {columns &&
                columns.length &&
                columns?.map((column, idx) => (
                  <td
                    key={idx}
                    className={twMerge(
                      `relative p-0 m-0 px-5 overflow-hidden ${tableInsideClass}  whitespace-nowrap`,
                      ` ${tdBodyClass} ${column?.className} `,
                    )}
                  >
                    {renderCell(item, column, index, data)}
                  </td>
                ))}
            </tr>
            {isExpandable(
              openExpandableRow,
              index,
              multiExpandable,
              ExpandingContent,
            ) && (
              <ExtentableContent
                index={index}
                item={item}
                columns={columns}
                data={data}
                ExpandingContent={ExpandingContent}
                expandableWidth={dimension?.offsetWidth}
              />
            )}
          </React.Fragment>
        );
      })}
    </tbody>
  );
  return (
    <div className={wrapperClass}>
      <main className={`relative ${tableWrapperClass} `}>
        <div ref={divRef} className="select-none">
          <table
            className={twMerge(
              `m-0 p-0 table-auto border-spacing-0 select-text border-separate  min-w-full `,
              ` ${tableClass} `,
            )}
          >
            {TableHead()}

            {TableBody()}
          </table>
        </div>
      </main>
    </div>
  );
};

export default TableMainBody;
