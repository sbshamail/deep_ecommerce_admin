import React, { useState } from "react";

import { actionMenuContents, filterActionMenuCondition } from "./function";

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
import Drawer from "../../drawer/Drawer";
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
  /** Slot for injecting extra elements (e.g. custom buttons) at the end of the bar */
  children?: React.ReactNode;
}

/** Consistent icon-button wrapper used for all action triggers */
const IconBtn = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center justify-center p-1.5 rounded-md cursor-pointer hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors">
    {children}
  </span>
);

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
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [drawerContent, setDrawerContent] = useState<ActionStateTypes>({
    Component: <></>,
    title: "",
    multiSelected: false,
  });

  const toggleDrawer = (toggle?: boolean) => {
    setDrawerToggle(toggle ? toggle : !drawerToggle);
  };

  const handleActionMenuContents = (
    listCondition: ActionMenuList[] | undefined,
  ) =>
    actionMenuContents(
      listCondition,
      selectedRows,
      setSelectedRows,
      toggleDrawer,
      setDrawerContent,
      removeSelection,
    );

  /** Renders a list of NewDropDownMenu items as DropdownList buttons */
  const renderDropdowns = (actionMenu: NewDropDownMenu[]): React.ReactNode[] =>
    actionMenu.map((menu, index) => {
      const listCondition = filterActionMenuCondition(
        menu.contents(),
        selectedRows,
      );
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
  const menuListCondition = filterActionMenuCondition(
    mainActionMenu,
    selectedRows,
  );

  const ExportHandle: NewDropDownMenu[] = [
    {
      Trigger: () => (
        <IconBtn>
          <FileDown size={16} />
        </IconBtn>
      ),
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

  return (
    <>
      <div className={`flex items-center gap-1 ${className ?? ""}`}>
        {/* Row-selection actions — only visible when rows are selected */}
        {menuListCondition && menuListCondition.length > 0 && (
          <DropdownList
            Trigger={() => (
              <IconBtn>
                <LayoutList size={16} />
              </IconBtn>
            )}
            contents={handleActionMenuContents(menuListCondition)}
          />
        )}

        {/* Consumer-supplied action slots — dropdowns render first, then custom render */}
        {newActionMenu &&
          newActionMenu().map((item, index) => (
            <React.Fragment key={index}>
              {item.dropdownMenu && renderDropdowns(item.dropdownMenu)}
              {item.render && item.render()}
            </React.Fragment>
          ))}

        {/* Built-in export dropdown */}
        {renderDropdowns(ExportHandle)}

        {/* Custom slot: pass children to add any extra buttons/elements */}
        {children}
      </div>

      <Drawer
        open={drawerToggle}
        close={toggleDrawer}
        title={drawerContent.title}
      >
        {typeof drawerContent.Component === "function"
          ? drawerContent.Component({
              removeSelection,
              selectedRows,
              setSelectedRows,
            })
          : drawerContent.Component}
      </Drawer>
    </>
  );
};

export default TableHeaderAction;
