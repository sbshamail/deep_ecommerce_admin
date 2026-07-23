"use client";

import { useEffect, useState } from "react";

import { CategoryTreeNode, ProductSingleRead } from "@/types/product_types";

import {
  ProductFormValues,
  ProductVariantFormValue,
} from "../schemas/productSchemas";

import { ProductFormBody } from "./ProductFormBody";

interface ProductFormProps {
  mode: "create" | "update";
  productId?: number;
  categories: CategoryTreeNode[];
  onSuccess?: (product: ProductSingleRead) => void;
  close?: () => void;
  /** Reports unsaved-changes state so the Sheet/Dialog owning this form can
   * confirm before closing (see ActionType.onDirtyChange). */
  onDirtyChange?: (dirty: boolean) => void;
}

export const emptyVariant: ProductVariantFormValue = {
  price: "0",
  discount_price: "",
  stock: "0",
  sku: "",
  attributes: [],
  imageFile: null,
  imageUrl: null,
};

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  category_id: "",
  is_active: true,
  is_featured: false,
  tags: "",
  variants: [emptyVariant],
  meta_title: "",
  meta_description: "",
};

const toDefaultValues = (product: ProductSingleRead): ProductFormValues => ({
  name: product.name,
  description: product.description ?? "",
  category_id: String(product.category.id),
  is_active: product.is_active,
  is_featured: product.is_featured,
  tags: (product.tags ?? []).join(", "),
  variants:
    product.variants && product.variants.length > 0
      ? product.variants.map((v) => ({
          id: v.id,
          price: String(v.price ?? 0),
          discount_price:
            v.discount_price != null ? String(v.discount_price) : "",
          stock: String(v.stock ?? 0),
          sku: v.sku ?? "",
          attributes: Object.entries(v.attributes ?? {}).map(
            ([key, value]) => ({
              key,
              value,
            }),
          ),
          imageFile: null,
          imageUrl: v.image?.original ?? null,
        }))
      : [emptyVariant],
  meta_title: product.meta_title ?? "",
  meta_description: product.meta_description ?? "",
});

// Handles fetching the full single-record read (list rows only carry variant
// ids, not price/stock/sku) before mounting the actual form in update mode.
const ProductForm = ({
  mode,
  productId,
  categories,
  onSuccess,
  close,
  onDirtyChange,
}: ProductFormProps) => {
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(
    mode === "create" ? emptyValues : null,
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // if mode is update then we call this api to get the full record
  useEffect(() => {
    if (mode !== "update" || !productId) return;

    let cancelled = false;
    fetch(`/api/product/read/${productId}`)
      .then((res) => res.json())
      .then((payload: { data?: ProductSingleRead; detail?: string }) => {
        if (cancelled) return;
        if (!payload.data) {
          setLoadError(payload.detail ?? "Failed to load product");
          return;
        }
        setInitialValues(toDefaultValues(payload.data));
        setThumbnailUrl(payload.data.thumbnail?.original ?? null);
      })
      .catch(() => !cancelled && setLoadError("Failed to load product"));

    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  if (!initialValues)
    return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <ProductFormBody
      mode={mode}
      productId={productId}
      categories={categories}
      defaultValues={initialValues}
      initialThumbnailUrl={thumbnailUrl}
      onSuccess={onSuccess}
      close={close}
      onDirtyChange={onDirtyChange}
    />
  );
};

export default ProductForm;
