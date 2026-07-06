import { CategoryTreeNode, LeafCategoryOption } from "@/types/product_types";

// Product create/update on the backend rejects non-leaf categories (see
// productRoute.py's create_product), so only leaves are offered here.
export function flattenLeafCategories(
  nodes: CategoryTreeNode[],
  prefix = "",
): LeafCategoryOption[] {
  return nodes.flatMap((node) => {
    const label = prefix ? `${prefix} > ${node.name}` : node.name;
    if (!node.children || node.children.length === 0) {
      return [{ id: node.id, label }];
    }
    return flattenLeafCategories(node.children, label);
  });
}
