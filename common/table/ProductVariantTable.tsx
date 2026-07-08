import Table from "@/components/cui/table";
import { ProductVariantBase } from "@/types/product_types";
import { ColumnType } from "@/types/table_types";

// ProductRead.variants (the list/expandable-row view) is ProductVariantBase[]
// — it doesn't carry product_id/created_at/updated_at, only ProductSingleRead
// (single product read/update) does. This table only renders pricing/stock
// fields, all present on the base shape, so it takes that directly.
const ProductVariantTable = ({ data }: { data: ProductVariantBase[] }) => {
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
      accessor: "is_in_stock",
    },
    {
      title: "sku",
      accessor: "sku",
    },
    {
      title: "attributes",
      accessor: "attributes",
    },
  ];
  return (
    <Table<ProductVariantBase>
      columns={columns}
      data={data}
      total={1}
      rowId="id"
      striped
    >
      <Table.Body />
    </Table>
  );
};

export default ProductVariantTable;
