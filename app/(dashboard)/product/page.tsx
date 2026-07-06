import ProductTable from "@/common/table/ProductTable";
import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedFetchList, backendFetch } from "@/lib/api/server";
import { flattenLeafCategories } from "@/lib/product/categories";
import { CategoryTreeNode, ProductRead } from "@/types/product_types";

const page = async () => {
  const token = await getAccessToken();
  if (!token) {
    return <p className="text-sm text-muted-foreground">Sign in to manage products.</p>;
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
    loadError = err instanceof ApiError ? err.message : "Failed to load products";
  }

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  let categoryTree: CategoryTreeNode[] = [];
  try {
    categoryTree = await backendFetch<CategoryTreeNode[]>("/category/list?limit=500");
  } catch {
    // Non-fatal — the create/edit form just offers no category options.
  }

  return (
    <ProductTable
      products={products}
      total={total}
      categories={flattenLeafCategories(categoryTree)}
    />
  );
};

export default page;
