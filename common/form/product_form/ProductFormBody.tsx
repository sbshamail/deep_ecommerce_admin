import SortableList from "@/components/cui/SortableList";
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
import { CategoryTreeNode, ProductSingleRead } from "@/types/product_types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import CategoryPicker from "../CategoryPicker";
import { ProductFormValues, productSchema } from "../schemas/productSchemas";
import { emptyVariant } from "./ProductForm";
import VariantRow from "./VariantRow";
interface ProductFormBodyProps {
  mode: "create" | "update";
  productId?: number;
  categories: CategoryTreeNode[];
  defaultValues: ProductFormValues;
  initialThumbnailUrl: string | null;
  onSuccess?: (product: ProductSingleRead) => void;
  close?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export const ProductFormBody = ({
  mode,
  productId,
  categories,
  defaultValues,
  initialThumbnailUrl,
  onSuccess,
  close,
  onDirtyChange,
}: ProductFormBodyProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialThumbnailUrl,
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  const isDirty = form.formState.isDirty || Boolean(thumbnailFile);
  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

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

    // Array order IS the position — the backend derives it from index, no
    // explicit field needed here.
    const variantData = values.variants.map((v) => ({
      id: v.id,
      price: Number(v.price),
      discount_price: v.discount_price ? Number(v.discount_price) : null,
      stock: Number(v.stock),
      sku: v.sku || null,
      attributes: Object.fromEntries(v.attributes.map((a) => [a.key, a.value])),
    }));
    formData.set("variant_data", JSON.stringify(variantData));

    values.variants.forEach((v, index) => {
      if (v.imageFile) formData.append(`variant_image_${index}`, v.imageFile);
    });

    if (thumbnailFile) formData.set("thumbnail", thumbnailFile);

    const url =
      mode === "create"
        ? "/api/product/create"
        : `/api/product/update/${productId}`;
    const res = await fetch(url, { method: "POST", body: formData });
    const payload = (await res.json().catch(() => null)) as {
      data?: ProductSingleRead;
      detail?: string;
    } | null;

    if (!res.ok || !payload?.data) {
      setServerError(payload?.detail ?? "Something went wrong");
      return;
    }

    onSuccess?.(payload.data);
    close?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
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
                <CategoryPicker
                  categories={categories}
                  value={field.value ? Number(field.value) : null}
                  onChange={(id) => field.onChange(id ? String(id) : "")}
                  leafOnly
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <FormLabel>Variants</FormLabel>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => append({ ...emptyVariant, attributes: [] })}
            >
              + Add variant
            </Button>
          </div>

          <SortableList
            items={fields}
            onReorder={move}
            className="space-y-3"
            renderItem={(field, index, dragHandleProps) => (
              <VariantRow
                key={field.id}
                form={form}
                index={index}
                dragHandleProps={dragHandleProps}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            )}
          />
          {form.formState.errors.variants?.root?.message && (
            <p className="text-sm text-destructive">
              {form.formState.errors.variants.root.message}
            </p>
          )}
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
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
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

        {serverError && (
          <p className="text-sm text-destructive">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
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
