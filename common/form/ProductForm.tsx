"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LeafCategoryOption, ProductSingleRead } from "@/types/product_types";

import { productSchema, ProductFormValues } from "./schemas/productSchemas";

interface ProductFormProps {
  mode: "create" | "update";
  productId?: number;
  categories: LeafCategoryOption[];
  onSuccess?: () => void;
  close?: () => void;
}

const emptyValues: ProductFormValues = {
  name: "",
  description: "",
  category_id: "",
  is_active: true,
  is_featured: false,
  tags: "",
  price: "0",
  discount_price: "",
  stock: "0",
  sku: "",
  meta_title: "",
  meta_description: "",
};

const toDefaultValues = (product: ProductSingleRead): ProductFormValues => {
  const variant = product.variants?.[0];
  return {
    name: product.name,
    description: product.description ?? "",
    category_id: String(product.category.id),
    is_active: product.is_active,
    is_featured: product.is_featured,
    tags: (product.tags ?? []).join(", "),
    price: String(variant?.price ?? 0),
    discount_price: variant?.discount_price != null ? String(variant.discount_price) : "",
    stock: String(variant?.stock ?? 0),
    sku: variant?.sku ?? "",
    meta_title: product.meta_title ?? "",
    meta_description: product.meta_description ?? "",
  };
};

// Handles fetching the full single-record read (list rows only carry variant
// ids, not price/stock/sku) before mounting the actual form in update mode.
const ProductForm = ({ mode, productId, categories, onSuccess, close }: ProductFormProps) => {
  const [initialValues, setInitialValues] = useState<ProductFormValues | null>(
    mode === "create" ? emptyValues : null,
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== "update" || !productId) return;

    let cancelled = false;
    fetch(`/api/product/${productId}`)
      .then((res) => res.json())
      .then((payload: { product?: ProductSingleRead; detail?: string }) => {
        if (cancelled) return;
        if (!payload.product) {
          setLoadError(payload.detail ?? "Failed to load product");
          return;
        }
        setInitialValues(toDefaultValues(payload.product));
        setThumbnailUrl(payload.product.thumbnail?.original ?? null);
      })
      .catch(() => !cancelled && setLoadError("Failed to load product"));

    return () => {
      cancelled = true;
    };
  }, [mode, productId]);

  if (loadError) return <p className="text-sm text-destructive">{loadError}</p>;
  if (!initialValues) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <ProductFormBody
      mode={mode}
      productId={productId}
      categories={categories}
      defaultValues={initialValues}
      initialThumbnailUrl={thumbnailUrl}
      onSuccess={onSuccess}
      close={close}
    />
  );
};

interface ProductFormBodyProps {
  mode: "create" | "update";
  productId?: number;
  categories: LeafCategoryOption[];
  defaultValues: ProductFormValues;
  initialThumbnailUrl: string | null;
  onSuccess?: () => void;
  close?: () => void;
}

const ProductFormBody = ({
  mode,
  productId,
  categories,
  defaultValues,
  initialThumbnailUrl,
  onSuccess,
  close,
}: ProductFormBodyProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialThumbnailUrl);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setThumbnailFile(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : initialThumbnailUrl);
  };

  const onSubmit = async (values: ProductFormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("description", values.description ?? "");
    formData.set("is_active", String(values.is_active));
    formData.set("is_featured", String(values.is_featured));
    formData.set("category_id", values.category_id);
    formData.set("meta_title", values.meta_title ?? "");
    formData.set("meta_description", values.meta_description ?? "");

    const tags = (values.tags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    formData.set("tags", JSON.stringify(tags));

    formData.set(
      "variant_data",
      JSON.stringify([
        {
          price: Number(values.price),
          discount_price: values.discount_price ? Number(values.discount_price) : null,
          stock: Number(values.stock),
          sku: values.sku || null,
        },
      ]),
    );

    if (thumbnailFile) formData.set("thumbnail", thumbnailFile);

    const url = mode === "create" ? "/api/product" : `/api/product/${productId}`;
    const res = await fetch(url, { method: "POST", body: formData });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setServerError(payload?.detail ?? "Something went wrong");
      return;
    }

    onSuccess?.();
    close?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-3">
          {previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Thumbnail preview"
              className="h-14 w-14 rounded-md border border-border object-cover"
            />
          )}
          <div className="flex-1 space-y-1">
            <FormLabel htmlFor="thumbnail">Thumbnail</FormLabel>
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-input file:bg-transparent file:px-2.5 file:py-1 file:text-sm"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  rows={3}
                  className="w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="discount_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount price</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="Optional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="comma, separated, tags" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-6">
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer">Active</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <FormLabel className="cursor-pointer">Featured</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="meta_title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta title</FormLabel>
              <FormControl>
                <Input placeholder="Optional (SEO)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meta_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta description</FormLabel>
              <FormControl>
                <Input placeholder="Optional (SEO)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && <p className="text-sm text-destructive">{serverError}</p>}

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? mode === "create"
              ? "Creating…"
              : "Saving…"
            : mode === "create"
              ? "Create product"
              : "Save changes"}
        </Button>
      </form>
    </Form>
  );
};

export default ProductForm;
