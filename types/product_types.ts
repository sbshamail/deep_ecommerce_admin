// Mirrors backend src/api/models/product_model/productModel.py and
// ProductVariantModel.py response shapes (ProductRead / ProductSingleRead).

export interface MediaRead {
  id: number;
  filename: string;
  original: string;
  thumbnail: string | null;
  media_type: string;
}

export interface ProductShopRead {
  id: number;
  name: string;
}

export interface ProductCategoryRead {
  id: number;
  name: string;
  root_id: number;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

// GET /product/list and /product/my-products only serialize variant ids —
// price/stock/sku are only present on the single-record read below.
export interface ProductVariantBase {
  id: number;
}

export interface ProductVariantRead {
  id: number;
  product_id: number;
  sku: string | null;
  price: number | null;
  discount_price: number | null;
  stock: number;
  is_in_stock: boolean;
  attributes: Record<string, string> | null;
  image: MediaRead | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProductRead {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: MediaRead | null;
  attributes: ProductAttribute[] | null;
  tags: string[] | null;
  meta_title: string | null;
  meta_description: string | null;
  is_active: boolean;
  is_featured: boolean;
  shop: ProductShopRead;
  category: ProductCategoryRead;
  variants: ProductVariantBase[] | null;
  created_at: string;
  updated_at: string | null;
}

export interface ProductSingleRead extends Omit<ProductRead, "variants"> {
  variants: ProductVariantRead[] | null;
}

// GET /category/list — a nested tree; the product form only allows picking a
// leaf (no children), matching the backend's create/update validation.
export interface CategoryTreeNode {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  root_id: number | null;
  is_active?: boolean;
  children: CategoryTreeNode[];
}

export interface LeafCategoryOption {
  id: number;
  label: string;
}
