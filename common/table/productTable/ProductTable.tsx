"use client";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";

import ProductForm from "@/common/form/product_form/ProductForm";
import Table from "@/components/cui/table";
import { removeById, upsertById } from "@/lib/list";
import { useAuth } from "@/providers/auth/authContext";
import {
  CategoryTreeNode,
  ProductRead,
  ProductSingleRead,
} from "@/types/product_types";
import { ActionType, ColumnType, NewActionMenu } from "@/types/table_types";
import ProductRowActions from "./ProductRowActions";
import ProductVariantTable from "./ProductVariantTable/ProductVariantTable";

interface ProductTableProps {
  products: ProductRead[];
  total: number;
  categories: CategoryTreeNode[];
}

// ProductSingleRead.variants carries a wider shape than the list row's
// ProductVariantBase (price nullable, extra fields) — normalize so a
// create/update response can drop straight into the table's row list.
const toProductRow = (product: ProductSingleRead): ProductRead => ({
  ...product,
  variants:
    product.variants?.map((v) => ({ ...v, price: v.price ?? 0 })) ?? null,
});

const ProductTable = ({ products, total, categories }: ProductTableProps) => {
  const { user, canInShop } = useAuth();
  // A fresh `products` prop means the server re-fetched (e.g. navigation) —
  // resync local state to it rather than keep stale patched rows. Adjusted
  // during render (not an effect) per React's "adjusting state on prop
  // change" pattern — avoids an extra render pass.
  const [prevProducts, setPrevProducts] = useState(products);
  const [rows, setRows] = useState(products);
  const [rowTotal, setRowTotal] = useState(total);
  if (products !== prevProducts) {
    setPrevProducts(products);
    setRows(products);
    setRowTotal(total);
  }
  const [selectedRows, setSelectedRows] = useState<ProductRead[]>([]);

  const columns: ColumnType<ProductRead>[] = [
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
    {
      title: "Category",
      accessor: "category.name",
      filterId: "category.name",
    },
    {
      title: "Price Range Min-Max",
      render: ({ row }) => (
        <span>
          {row?.min_price}-{row?.max_price}
        </span>
      ),
      filterId: "min_price",
    },
    {
      title: "Stock",
      accessor: "total_stock",
      filterId: "total_stock",
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
    {
      title: "Featured",
      accessor: "is_featured",
      render: ({ cell }) => (cell ? "Yes" : "No"),
    },
    { title: "Created", accessor: "created_at", type: "date" },
    {
      title: "Actions",
      headerClassName: "sticky right-0 bg-muted",
      className: "sticky right-0 bg-muted",
      render: ({ row }) =>
        row && (
          <ProductRowActions
            product={row}
            onDeleted={(id) => {
              setRows((prev) => removeById(prev, id));
              setRowTotal((prev) => Math.max(0, prev - 1));
            }}
          />
        ),
    },
  ];

  const canCreate = canInShop(user?.default_shop_id, "product:create");
  const canUpdate = canInShop(
    user?.default_shop_id,
    "product:create",
    "product:update",
  );

  // Top toolbar buttons (not a dropdown) — Edit always shows but is
  // disabled unless the user can update AND exactly one row is selected
  // (there's no other row to edit against). Create shows whenever the
  // user has permission.
  const newActionMenu = ({
    rows,
  }: {
    rows: ProductRead[];
  }): NewActionMenu<ProductRead>[] => [
    {
      click: () => ({
        title: "Edit",
        Icon: Pencil,
        resizable: true,
        width: { default: 720, min: 480, max: 1100 },
        disabled: !canUpdate || rows.length !== 1,
        Component: (ctx: ActionType<ProductRead>) => {
          const row = ctx.selectedRows[0];
          return (
            <ProductForm
              mode="update"
              productId={row?.id}
              categories={categories}
              onSuccess={(updated) =>
                setRows((prev) => upsertById(prev, toProductRow(updated)))
              }
              close={ctx.close}
              onDirtyChange={ctx.onDirtyChange}
            />
          );
        },
      }),
    },
    {
      click: () => ({
        title: "Create product",
        Icon: Plus,
        className: canCreate ? "" : "hidden",
        resizable: true,
        width: { default: 720, min: 480, max: 1100 },
        Component: (ctx: ActionType<ProductRead>) => {
          return (
            <ProductForm
              mode="create"
              categories={categories}
              onSuccess={(created) => {
                setRows((prev) => upsertById(prev, toProductRow(created)));
                setRowTotal((prev) => prev + 1);
              }}
              close={ctx.close}
              onDirtyChange={ctx.onDirtyChange}
            />
          );
        },
      }),
    },
  ];

  return (
    <Table<ProductRead>
      data={rows}
      columns={columns}
      total={rowTotal}
      rowId="id"
      striped
      showColumnFilter
      selectedRows={selectedRows}
      setSelectedRows={setSelectedRows}
      expandable={true}
      ExpandingContent={(row: ProductRead) => (
        <ProductVariantTable
          productId={row.id}
          data={row?.variants || []}
          onSelectionChange={(variantRows) => {
            // Picking a specific variant is a different intent than bulk-
            // selecting the whole product — drop the product from selection
            // once any of its variants are selected.
            if (variantRows.length > 0) {
              setSelectedRows((prev) => prev.filter((r) => r.id !== row.id));
            }
          }}
          onVariantSaved={(saved) =>
            setRows((prev) =>
              prev.map((p) =>
                p.id === row.id
                  ? { ...p, variants: upsertById(p.variants ?? [], saved) }
                  : p,
              ),
            )
          }
          onVariantDeleted={(variantId) =>
            setRows((prev) =>
              prev.map((p) =>
                p.id === row.id
                  ? {
                      ...p,
                      variants:
                        p.variants?.filter((v) => v.id !== variantId) ?? null,
                    }
                  : p,
              ),
            )
          }
        />
      )}
      newActionMenu={newActionMenu}
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
