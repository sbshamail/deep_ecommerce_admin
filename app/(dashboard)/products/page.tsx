import ProductTable from "@/common/table/productTable/ProductTable";
import { ApiError, authorizedFetchList, backendFetch } from "@/lib/api/server";
import { getAccessToken } from "@/providers/auth/session";
import { CategoryTreeNode, ProductRead } from "@/types/product_types";

const page = async () => {
  const token = await getAccessToken();
  if (!token) {
    return (
      <p className="text-sm text-muted-foreground">
        Sign in to manage products.
      </p>
    );
  }

  let products: ProductRead[] = [];
  let total = 0;
  let loadError: string | null = null;

  try {
    const result = await authorizedFetchList<ProductRead>(
      "/product/my-products?limit=200",
      token,
      { cache: "no-store" },
    );
    products = result.data;
    total = result.total;
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load products";
  }

  let categoryTree: CategoryTreeNode[] = [];
  try {
    categoryTree = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
  } catch {
    // Non-fatal — the create/edit form just offers no category options.
  }

  return (
    <ProductTable
      products={products}
      total={total}
      categories={categoryTree}
      loadError={loadError}
    />
  );
};

export default page;
