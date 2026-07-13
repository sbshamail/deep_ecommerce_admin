"use client";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/auth/authContext";
import CategoryForm from "@/common/form/CategoryForm";
import Table from "@/components/cui/table";
import { CategoryTreeNode } from "@/types/product_types";
import { ActionMenuList, ActionType, ColumnType } from "@/types/table_types";

interface CategoryTableProps {
  categories: CategoryTreeNode[];
}

// Flat row = a tree node minus its children, plus a computed depth for
// indentation and the count of direct children (delete is blocked on these
// by the backend, so it's worth surfacing before someone tries).
interface CategoryRow extends Omit<CategoryTreeNode, "children"> {
  depth: number;
  childCount: number;
}

function flattenTree(nodes: CategoryTreeNode[], depth = 0): CategoryRow[] {
  return nodes.flatMap(({ children, ...node }) => [
    { ...node, depth, childCount: children.length },
    ...flattenTree(children, depth + 1),
  ]);
}

const columns: ColumnType<CategoryRow>[] = [
  {
    title: "Name",
    accessor: "name",
    filterId: "name",
    render: ({ row }) => (
      <span style={{ paddingLeft: `${(row?.depth ?? 0) * 1.25}rem` }}>
        {row?.name}
      </span>
    ),
  },
  { title: "Level", accessor: "level" },
  {
    title: "Children",
    accessor: "childCount",
    render: ({ cell }) => (Number(cell) > 0 ? String(cell) : "—"),
  },
  {
    title: "Status",
    accessor: "is_active",
    render: ({ cell }) => (
      <span className={cell ? "text-green-600" : "text-muted-foreground"}>
        {cell ? "Active" : "Inactive"}
      </span>
    ),
  },
  { title: "Created", accessor: "created_at", type: "date" },
];

const CategoryTable = ({ categories }: CategoryTableProps) => {
  const router = useRouter();
  const { can } = useAuth();
  const [selectedRows, setSelectedRows] = useState<CategoryRow[]>([]);

  const canCreate = can("category:create");
  const canUpdate = can("category:create", "category:update");
  const canDelete = can("category:delete");

  const rows = flattenTree(categories);
  const refresh = () => router.refresh();

  const actionMenuList = ({
    rows,
  }: {
    rows: CategoryRow[];
  }): ActionMenuList<CategoryRow>[] => {
    const items: ActionMenuList<CategoryRow>[] = [];
    if (canUpdate) {
      items.push({
        title: "Edit",
        Icon: Pencil,
        visible: "selected",
        Component: (ctx: ActionType<CategoryRow>) => {
          const row = ctx.selectedRows[0];
          return (
            <CategoryForm
              mode="update"
              category={row}
              categories={categories}
              onSuccess={refresh}
              close={ctx.close}
              onDirtyChange={ctx.onDirtyChange}
            />
          );
        },
      });
    }
    if (canDelete) {
      items.push({
        title: "Delete",
        deleted: async ({ selectedRows: rowsToDelete, removeSelection }) => {
          const row = rowsToDelete[0];
          if (!row) return;
          const res = await fetch(`/api/category/${row.id}`, { method: "DELETE" });
          if (!res.ok) {
            const payload = await res.json().catch(() => null);
            // The backend blocks deletes with children/products — surface
            // that message rather than failing silently.
            window.alert(payload?.detail ?? "Failed to delete category");
            return;
          }
          removeSelection();
          refresh();
        },
        visible: "selected",
      });
    }
    return items;
  };

  return (
    <Table<CategoryRow>
      data={rows}
      columns={columns}
      total={rows.length}
      rowId="id"
      striped
      showColumnFilter
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      actionMenuList={canUpdate || canDelete ? actionMenuList : undefined}
      newActionMenu={
        canCreate
          ? () => [
              {
                click: () => ({
                  title: "Create category",
                  Icon: Plus,
                  Component: (ctx: ActionType<CategoryRow>) => (
                    <CategoryForm
                      mode="create"
                      categories={categories}
                      onSuccess={refresh}
                      close={ctx.close}
                      onDirtyChange={ctx.onDirtyChange}
                    />
                  ),
                }),
              },
            ]
          : undefined
      }
      tableWrapperClass="max-h-[calc(100svh-330px)] overflow-auto"
    >
      <Table.Header className="min-w-0 border-b border-border p-2 font-semibold">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div />
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
            <Table.Search />
            <Table.ColumnFilter />
            <Table.FullScreen />
          </div>
        </div>
        <Table.Action className="mt-2 flex-wrap" />
        <Table.FilterBadges />
      </Table.Header>
      <Table.Body />
      <Table.Pagination />
    </Table>
  );
};

export default CategoryTable;
