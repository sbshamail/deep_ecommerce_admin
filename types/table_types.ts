import React, { JSX } from "react";
import { ClassNameType } from "./common_types";

// export interface MenuListAction {
//   selectedRows: Record<string, any>[];
// }

export interface ActionType {
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  removeSelection: () => void;
  /** Closes the Sheet/Dialog this Component is rendering inside of. */
  close?: () => void;
}

export interface ActionMenuList {
  title: string;
  Icon?: React.ElementType;
  visible?: "selected" | "unselected";
  multiSelected?: boolean;
  action?: (ctx: ActionType) => void;
  deleted?: (ctx: ActionType) => void;
  Component?: ((ctx: ActionType) => JSX.Element) | JSX.Element;
  /** Open Component in a centered Dialog instead of a side Sheet */
  modal?: boolean;
}

export interface RenderType {
  row: number | string | Record<string, unknown> | null;
  index: number;
  data: Record<string, unknown>[];
  cell: string | number | Record<string, unknown> | null;
}
export interface ColumnType {
  title: string;
  accessor: string;
  filterId?: string;
  type?: "date" | "currency";
  currency?: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR";
  format?: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN";
  render?: ({ row, index, data, cell }: RenderType) => void;
  className?: React.ComponentProps<"div">["className"];
}
export type ColumnKey = "title" | "accessor" | "filterId";
export interface ColumnFilterType {
  id: string;
  value: string;
}
export interface NewDropDownMenu {
  Trigger: () => React.ReactNode;
  contents: () => ActionMenuList[];
}
export interface NewActionMenu {
  dropdownMenu?: NewDropDownMenu[];
  click?: () => ActionMenuList;
  render?: () => React.ReactNode;
}
export interface ActionStateTypes {
  Component: ((props: ActionType) => JSX.Element) | JSX.Element;
  multiSelected?: boolean;
  title: string;
}
export type ExpandingTableType = (props: {
  data: Record<string, unknown>[];
  row: Record<string, unknown>;
  index: number;
}) => React.ReactNode;
export type ActionMenuListType = () => ActionMenuList[];
export type NewActionMenuType = () => NewActionMenu[];

export interface TableMainClassesType {
  tableClass?: ClassNameType;
  tHeadClass?: ClassNameType;
  tableInsideClass?: ClassNameType;
  trHeadClass?: ClassNameType;
  thHeadClass?: ClassNameType;
  tBodyClass?: ClassNameType;
  trBodyClass?: ClassNameType;
  tdBodyClass?: ClassNameType;
}

export interface TableTabsType {
  data: Record<string, unknown>[];
  columns: ColumnType[];
  total?: number;
  actionMenuList?: ActionMenuListType; // function to generate action menu items based on row data.
  newActionMenu?: NewActionMenuType;
  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType;
  titleTable?: string | JSX.Element;
  rowId?: string;
}

export type TableType = TableTabsType;
