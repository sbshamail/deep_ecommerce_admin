import React, { useState } from "react";

import { actionMenuContents, filterActionMenuCondition } from "./function";

import {
  ActionMenuList,
  ActionMenuListType,
  ActionStateTypes,
  ColumnType,
  NewActionMenu,
  NewDropDownMenu,
} from "@/types/table_types";
import { ExternalLink, FileDown } from "lucide-react";
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
  newActionMenu?: ({}) => NewActionMenu[];
  removeSelection: () => void;
  columns: ColumnType[];
}
const TableHeaderAction = ({
  data,
  columns,
  actionMenuList,
  selectedRows,
  setSelectedRows,
  newActionMenu,
  removeSelection,
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
  ) => {
    return actionMenuContents(
      listCondition,
      selectedRows,
      setSelectedRows,
      toggleDrawer,
      setDrawerContent,
      removeSelection,
    );
  };
  //new Action Menu
  const newActionMenuRender = (
    actionMenu: NewDropDownMenu[],
  ): React.ReactNode[] => {
    return actionMenu.map((menu, index) => {
      const contents = menu.contents({});
      const listCondition = filterActionMenuCondition(contents, selectedRows);
      return (
        listCondition &&
        listCondition.length > 0 && (
          <div key={index}>
            <DropdownList
              Trigger={menu?.Trigger}
              contents={handleActionMenuContents(listCondition)}
            />
          </div>
        )
      );
    });
  };

  // main action
  const mainActionMenu = actionMenuList ? actionMenuList({}) : undefined;
  const menuListCondition = filterActionMenuCondition(
    mainActionMenu,
    selectedRows,
  );
  const singleIconAction = (
    action: (props: Record<string, unknown> | null) => React.ReactNode,
  ) => {
    return (
      <div>
        <div>{action({})}</div>
      </div>
    );
  };
  const ExportHandle: NewDropDownMenu[] = [
    {
      Trigger: () => <FileDown />,
      contents: ({}: Record<string, unknown>) => [
        {
          title: "Export All",
          icon: "solar:file-download-bold",
          action: () => {
            handleExportCsv(data as ExportCsvRow[]);
          },
        },
        {
          title: " Export Selected",
          Trigger: () => <span>solar:file-download-bold</span>,
          action: () => {
            handleArrangeCsvData(selectedRows, columns);
          },
          visible: "selected",
          multiSelected: true,
        },
      ],
    },
  ];
  return (
    <>
      <div>
        <div className="flex items-center relative">
          {menuListCondition && menuListCondition.length > 0 && (
            <DropdownList
              Trigger={() => <ExternalLink />}
              contents={handleActionMenuContents(menuListCondition)}
            />
          )}
          {newActionMenu &&
            newActionMenu({}).map((item, index) => {
              return (
                <React.Fragment key={index}>
                  {item.action && item.Icon
                    ? singleIconAction(item.action)
                    : item.dropdownMenu
                      ? newActionMenuRender(item.dropdownMenu)
                      : null}
                </React.Fragment>
              );
            })}
          <React.Fragment>{newActionMenuRender(ExportHandle)}</React.Fragment>
        </div>
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
