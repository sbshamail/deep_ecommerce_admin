import { useState } from "react";

import Table from "@/components/cui/table";
import { ProductVariantBase } from "@/types/product_types";
import { ColumnType } from "@/types/table_types";

interface ProductVariantTableProps {
  data: ProductVariantBase[];
  /** Fires with the current variant selection whenever it changes — the
   * parent product row uses this to deselect itself once you're picking
   * specific variants instead of the whole product. */
  onSelectionChange?: (rows: ProductVariantBase[]) => void;
}

// ProductRead.variants (the list/expandable-row view) is ProductVariantBase[]
// — it doesn't carry product_id/created_at/updated_at, only ProductSingleRead
// (single product read/update) does. This table only renders pricing/stock
// fields, all present on the base shape, so it takes that directly.
const ProductVariantTable = ({
  data,
  onSelectionChange,
}: ProductVariantTableProps) => {
  const [selectedRows, setSelectedRows] = useState<ProductVariantBase[]>([]);

  const handleSelectionChange = (rows: ProductVariantBase[]) => {
    setSelectedRows(rows);
    onSelectionChange?.(rows);
  };

  const columns: ColumnType<ProductVariantBase>[] = [
    {
      title: "price",
      accessor: "price",
    },
    {
      title: "discount_price",
      accessor: "discount_price",
      type: "currency",
    },
    {
      title: "Stock",
      accessor: "stock",
    },
    {
      title: "is_in_stock",
      render: ({ cell }) => (cell ? "Yes" : "No"),
    },
    {
      title: "sku",
      accessor: "sku",
    },
    {
      title: "Attributes",
      accessor: "attributes",
      render: ({ cell }) => {
        console.log({ cell }, typeof cell);
        if (!cell || typeof cell !== "object") {
          return <span>—</span>;
        }

        return (
          <div className="space-y-1">
            {Object.entries(cell as Record<string, unknown>).map(
              ([key, value]) => (
                <div key={key}>
                  <strong>{key}:</strong> {String(value)}
                </div>
              ),
            )}
          </div>
        );
      },
    },
  ];
  console.log(data);
  return (
    <Table<ProductVariantBase>
      columns={columns}
      data={data}
      total={1}
      rowId="id"
      striped
      className="border-2 border-t-0  border-foreground/50 mx-2 rounded-bl-2xl rounded-br-2xl"
      // selectedRows={selectedRows}
      // setSelectedRows={handleSelectionChange}
    >
      <Table.Body />
    </Table>
  );
};

export default ProductVariantTable;
