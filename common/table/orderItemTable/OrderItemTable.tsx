"use client";
import { useState } from "react";

import Table from "@/components/cui/table";
import { useAuth } from "@/providers/auth/authContext";
import { ColumnType } from "@/types/table_types";
import { OrderItemRead } from "@/types/order_types";
import OrderItemStatusSelect from "./OrderItemStatusSelect";

interface OrderItemTableProps {
  orderItems: OrderItemRead[];
  total: number;
  loadError?: string | null;
}

const OrderItemTable = ({
  orderItems,
  total,
  loadError,
}: OrderItemTableProps) => {
  const { user, canInShop } = useAuth();
  // A fresh `orderItems` prop means the server re-fetched (e.g. navigation) —
  // resync local state to it rather than keep stale patched rows. Adjusted
  // during render (not an effect) per React's "adjusting state on prop
  // change" pattern — avoids an extra render pass.
  const [prevOrderItems, setPrevOrderItems] = useState(orderItems);
  const [rows, setRows] = useState(orderItems);
  const [rowTotal, setRowTotal] = useState(total);
  if (orderItems !== prevOrderItems) {
    setPrevOrderItems(orderItems);
    setRows(orderItems);
    setRowTotal(total);
  }

  const [prevLoadError, setPrevLoadError] = useState(loadError);
  const [error, setError] = useState(loadError ?? null);
  if (loadError !== prevLoadError) {
    setPrevLoadError(loadError);
    setError(loadError ?? null);
  }

  const canUpdate = canInShop(user?.default_shop_id, "order:update");

  const columns: ColumnType<OrderItemRead>[] = [
    {
      title: "Image",
      accessor: "image.original",
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
    { title: "Product", accessor: "product_name", filterId: "product_name" },
    {
      title: "Variant",
      render: ({ row }) =>
        row?.variant_attributes ? (
          <span>
            {Object.entries(row.variant_attributes)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    { title: "Order #", accessor: "order_id" },
    { title: "Qty", accessor: "quantity" },
    {
      title: "Price",
      render: ({ row }) => <span>{row?.price}</span>,
    },
    {
      title: "Status",
      headerClassName: "sticky right-0 bg-muted",
      className: "sticky right-0 bg-muted",
      render: ({ row }) =>
        row && (
          <OrderItemStatusSelect
            id={row.id}
            status={row.status}
            canUpdate={canUpdate}
            onUpdated={(id, status) =>
              setRows((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, status } : item,
                ),
              )
            }
          />
        ),
    },
  ];

  return (
    <Table<OrderItemRead>
      data={rows}
      columns={columns}
      total={rowTotal}
      rowId="id"
      striped
      showColumnFilter
      emptyState={
        <div className="flex flex-col items-center justify-center gap-1 py-10 text-sm">
          <span className="font-medium text-foreground">
            No order items found
          </span>
          <span className="text-muted-foreground">
            Orders placed against your shop will show up here.
          </span>
        </div>
      }
      tableWrapperClass="max-h-[calc(100svh-330px)] overflow-auto"
    >
      <Table.Header className="min-w-0 border-b border-border p-2 font-semibold">
        {error && (
          <p className="mb-2 text-sm font-normal text-destructive">{error}</p>
        )}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          <Table.Dates />
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-1">
            <Table.Search />
            <Table.ColumnFilter />
            <Table.FullScreen />
          </div>
        </div>
        <Table.FilterBadges />
      </Table.Header>
      <Table.Body />

      <Table.Pagination />
    </Table>
  );
};

export default OrderItemTable;
