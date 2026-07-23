import React, { JSX } from "react";
import { ClassNameType } from "./common_types";

// export interface MenuListAction {
//   selectedRows: Record<string, any>[];
// }

export interface ActionType<T = Record<string, unknown>> {
  selectedRows: T[];
  setSelectedRows: (rows: T[]) => void;
  removeSelection: () => void;
  /** Closes the Sheet/Dialog this Component is rendering inside of. */
  close?: () => void;
  /** Report unsaved-changes state so the Sheet/Dialog can confirm before closing. */
  onDirtyChange?: (dirty: boolean) => void;
}

export interface SheetWidthConfig {
  default: number;
  min: number;
  max: number;
}

export interface ActionMenuList<T = Record<string, unknown>> {
  title: string;
  Icon?: React.ElementType;
  visible?: "selected" | "unselected";
  multiSelected?: boolean;
  action?: (ctx: ActionType<T>) => void;
  deleted?: (ctx: ActionType<T>) => void;
  Component?: ((ctx: ActionType<T>) => JSX.Element) | JSX.Element;
  /** Open Component in a centered Dialog instead of a side Sheet */
  modal?: boolean;
  /** Opens the side Sheet wide and lets the user drag its edge to resize. */
  sheetResizable?: boolean;
  sheetWidth?: SheetWidthConfig;
}

export interface RenderType<T = Record<string, unknown>> {
  row: T | null;
  index: number;
  data: T[];
  cell: string | number | Record<string, unknown> | null;
}
export interface ColumnType<T = Record<string, unknown>> {
  title: string;
  accessor?: string;
  filterId?: string;
  type?: "date" | "currency";
  currency?: "PKR" | "SAR" | "EUR" | "JPY" | "USD" | "INR";
  format?: "en-PK" | "en-US" | "de-DE" | "ja-JP" | "en-IN";
  render?: ({ row, index, data, cell }: RenderType<T>) => React.ReactNode;
  className?: React.ComponentProps<"div">["className"];
}
export type ColumnKey = "title" | "accessor" | "filterId";
export interface ColumnFilterType {
  id: string;
  value: string;
}
export interface NewDropDownMenu<T = Record<string, unknown>> {
  Trigger: () => React.ReactNode;
  contents: () => ActionMenuList<T>[];
}
export interface NewActionMenu<T = Record<string, unknown>> {
  dropdownMenu?: NewDropDownMenu<T>[];
  click?: () => ActionMenuList<T>;
  render?: () => React.ReactNode;
}
export interface ActionStateTypes<T = Record<string, unknown>> {
  Component: ((props: ActionType<T>) => JSX.Element) | JSX.Element;
  multiSelected?: boolean;
  title: string;
  sheetResizable?: boolean;
  sheetWidth?: SheetWidthConfig;
}
/** row first so `(row) => <Foo .../>` works without destructuring; index/data are there if you need them. */
export type ExpandingTableType<T = Record<string, unknown>> = (
  row: T,
  index: number,
  data: T[],
) => React.ReactNode;
export type menuTableType<T = Record<string, unknown>> = { rows: T[] };
export type ActionMenuListType<T = Record<string, unknown>> = (
  ctx: menuTableType<T>,
) => ActionMenuList<T>[];
export type NewActionMenuType<T = Record<string, unknown>> = (
  ctx: menuTableType<T>,
) => NewActionMenu<T>[];

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

export interface TableTabsType<T = Record<string, unknown>> {
  data: T[];
  columns: ColumnType<T>[];
  total?: number;
  actionMenuList?: ActionMenuListType<T>; // function to generate action menu items based on row data.
  newActionMenu?: NewActionMenuType<T>;
  expandable?: boolean;
  multiExpandable?: boolean;
  ExpandingContent?: ExpandingTableType<T>;
  titleTable?: string | JSX.Element;
  rowId?: string;
}

export type TableType = TableTabsType;
