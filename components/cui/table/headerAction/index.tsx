import React, { useState } from "react";

import { actionMenuContents, filterActionMenuCondition } from "./function";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClassNameType } from "@/types/common_types";
import {
  ActionMenuList,
  ActionMenuListType,
  ActionStateTypes,
  ColumnType,
  NewActionMenu,
  NewDropDownMenu,
} from "@/types/table_types";
import { FileDown, LayoutList } from "lucide-react";
import DropdownList from "../../DropdownList";
import {
  ExportCsvRow,
  handleArrangeCsvData,
  handleExportCsv,
} from "../components/generateExcel";

interface TableHeaderActionType {
  data: Record<string, unknown>[];
  actionMenuList?: ActionMenuListType;
  selectedRows: Record<string, unknown>[];
  setSelectedRows: (rows: Record<string, unknown>[]) => void;
  newActionMenu?: () => NewActionMenu[];
  removeSelection: () => void;
  columns: ColumnType[];
  className?: ClassNameType;
  children?: React.ReactNode;
}

const emptyContent: ActionStateTypes = {
  Component: <></>,
  title: "",
  multiSelected: false,
};

const TableHeaderAction = ({
  className,
  data,
  columns,
  actionMenuList,
  selectedRows,
  setSelectedRows,
  newActionMenu,
  removeSelection,
  children,
}: TableHeaderActionType) => {
  // Sheet (side drawer) state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetContent, setSheetContent] = useState<ActionStateTypes>(emptyContent);

  // Dialog (centered modal) state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ActionStateTypes>(emptyContent);

  const toggleSheet = (open?: boolean) =>
    setSheetOpen((prev) => (open !== undefined ? open : !prev));

  const toggleDialog = (open?: boolean) =>
    setDialogOpen((prev) => (open !== undefined ? open : !prev));

  const handleActionMenuContents = (listCondition: ActionMenuList[] | undefined) =>
    actionMenuContents(
      listCondition,
      selectedRows,
      setSelectedRows,
      () => toggleSheet(),
      setSheetContent,
      removeSelection,
      () => toggleDialog(),
      setDialogContent,
    );

  const renderDropdowns = (actionMenu: NewDropDownMenu[]): React.ReactNode[] =>
    actionMenu.map((menu, index) => {
      const listCondition = filterActionMenuCondition(menu.contents(), selectedRows);
      if (!listCondition || listCondition.length === 0) return null;
      return (
        <DropdownList
          key={index}
          Trigger={menu.Trigger}
          contents={handleActionMenuContents(listCondition)}
        />
      );
    });

  const mainActionMenu = actionMenuList ? actionMenuList() : undefined;
  const menuListCondition = filterActionMenuCondition(mainActionMenu, selectedRows);

  const ExportHandle: NewDropDownMenu[] = [
    {
      Trigger: () => <FileDown size={16} />,
      contents: () => [
        {
          title: "Export All",
          Icon: FileDown,
          action: () => handleExportCsv(data as ExportCsvRow[]),
        },
        {
          title: "Export Selected",
          Icon: FileDown,
          action: () => handleArrangeCsvData(selectedRows, columns),
          visible: "selected",
          multiSelected: true,
        },
      ],
    },
  ];

  const renderComponent = (state: ActionStateTypes) =>
    typeof state.Component === "function"
      ? state.Component({ removeSelection, selectedRows, setSelectedRows })
      : state.Component;

  return (
    <>
      <div className={`flex items-center gap-1 ${className ?? ""}`}>
        {menuListCondition && menuListCondition.length > 0 && (
          <DropdownList
            Trigger={() => <LayoutList size={16} />}
            contents={handleActionMenuContents(menuListCondition)}
          />
        )}

        {newActionMenu &&
          newActionMenu().map((item, index) => (
            <React.Fragment key={index}>
              {item.dropdownMenu && renderDropdowns(item.dropdownMenu)}
              {item.render && item.render()}
            </React.Fragment>
          ))}

        {renderDropdowns(ExportHandle)}
        {children}
      </div>

      {/* Side drawer — default for Component items */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{sheetContent.title}</SheetTitle>
          </SheetHeader>
          <SheetBody>{renderComponent(sheetContent)}</SheetBody>
        </SheetContent>
      </Sheet>

      {/* Centered dialog — for items with modal: true */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">{renderComponent(dialogContent)}</div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TableHeaderAction;
