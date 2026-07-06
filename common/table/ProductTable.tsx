"use client";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/auth/authContext";
import ProductForm from "@/common/form/ProductForm";
import Table from "@/components/cui/table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ActionMenuList, ActionType, ColumnType } from "@/types/table_types";
import { LeafCategoryOption, ProductRead } from "@/types/product_types";

interface ProductTableProps {
  products: ProductRead[];
  total: number;
  categories: LeafCategoryOption[];
}

const columns: ColumnType[] = [
  {
    title: "Thumbnail",
    accessor: "thumbnail.original",
    render: ({ cell }) =>
      cell ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cell as string}
          alt=""
          className="h-8 w-8 rounded object-cover"
        />
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  { title: "Name", accessor: "name", filterId: "name" },
  { title: "Category", accessor: "category.name", filterId: "category.name" },
  {
    title: "Status",
    accessor: "is_active",
    render: ({ cell }) => (
      <span className={cell ? "text-green-600" : "text-muted-foreground"}>
        {cell ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    title: "Featured",
    accessor: "is_featured",
    render: ({ cell }) => (cell ? "Yes" : "No"),
  },
  { title: "Created", accessor: "created_at", type: "date" },
];

const CreateProductButton = ({
  categories,
  onSuccess,
}: {
  categories: LeafCategoryOption[];
  onSuccess: () => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => setOpen(true)}>
        <Plus size={12} />
        Create
      </Button>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Create product</SheetTitle>
        </SheetHeader>
        <SheetBody>
          <ProductForm
            mode="create"
            categories={categories}
            onSuccess={onSuccess}
            close={() => setOpen(false)}
          />
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

const ProductTable = ({ products, total, categories }: ProductTableProps) => {
  const router = useRouter();
  const { user, canInShop } = useAuth();

  const canCreate = canInShop(user?.default_shop_id, "product:create");
  const canUpdate = canInShop(user?.default_shop_id, "product:create", "product:update");

  const refresh = () => router.refresh();

  const actionMenuList = (): ActionMenuList[] => {
    if (!canUpdate) return [];
    return [
      {
        title: "Edit",
        Icon: Pencil,
        visible: "selected",
        Component: (ctx: ActionType) => {
          const row = ctx.selectedRows[0] as unknown as ProductRead;
          return (
            <ProductForm
              mode="update"
              productId={row.id}
              categories={categories}
              onSuccess={refresh}
              close={ctx.close}
            />
          );
        },
      },
    ];
  };

  return (
    <Table
      data={products as unknown as Record<string, unknown>[]}
      columns={columns}
      total={total}
      rowId="id"
      striped
      showColumnFilter
      actionMenuList={canUpdate ? actionMenuList : undefined}
      newActionMenu={
        canCreate
          ? () => [{ render: () => <CreateProductButton categories={categories} onSuccess={refresh} /> }]
          : undefined
      }
      tableWrapperClass="max-h-[calc(100svh-330px)] overflow-auto"
    >
      <Table.Header className="min-w-0 border-b border-border p-2 font-semibold">
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <Table.Dates />
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

export default ProductTable;
