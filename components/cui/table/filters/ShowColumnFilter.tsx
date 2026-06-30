import { ColumnType } from "@/types/table_types";
import { ListFilter } from "lucide-react";
import React from "react";
import DropdownList, { ContentItem } from "../../DropdownList";

export interface ColumnFilterFieldsType {
  columnFilterField?: ColumnType[];
  setColumnFilterFields?: React.Dispatch<React.SetStateAction<ColumnType[]>>;
}
interface Props extends ColumnFilterFieldsType {
  columns: ColumnType[];
}
const ShowColumnFilter = ({
  columns,
  columnFilterField,
  setColumnFilterFields,
}: Props) => {
  const handleShowsFilter = (item: ColumnType) => {
    if (setColumnFilterFields) {
      if (columnFilterField?.some((v) => v.filterId === item.filterId)) {
        // Remove the item if it is already included
        setColumnFilterFields((prev) =>
          prev.filter((v) => v.filterId !== item.filterId),
        );
      } else {
        // Add the item if it is not included
        setColumnFilterFields((prev) => [...prev, item]);
      }
    }
  };
  const contents: ContentItem[] = columns
    .filter((column) => column.filterId)
    .map((column) => ({
      title: column.title,
      click: () => handleShowsFilter(column),
      className: `  ${
        columnFilterField?.some((v) => v.filterId === column.filterId)
          ? "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary) "
          : ""
      }`,
    }));
  return (
    <div>
      <DropdownList
        Trigger={() => <ListFilter />}
        contents={contents}
        contentClass={`pr-8 border border-border`}
      />
    </div>
  );
};

export default ShowColumnFilter;
