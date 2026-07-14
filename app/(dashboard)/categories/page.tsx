import CategoryDropdown from "@/common/pages/CategoryDropdown";
import { ApiError, backendFetch } from "@/lib/api/server";
import { CategoryTreeNode } from "@/types/product_types";

const page = async () => {
  let categories: CategoryTreeNode[] = [];
  let loadError: string | null = null;

  try {
    categories = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
  } catch (err) {
    loadError =
      err instanceof ApiError ? err.message : "Failed to load categories";
  }

  if (loadError) {
    return <p className="text-sm text-destructive">{loadError}</p>;
  }

  return <CategoryDropdown categories={categories} />;
};

export default page;
