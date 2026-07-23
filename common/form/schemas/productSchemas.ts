import { z } from "zod";

const numericString = (message: string) =>
  z.string().min(1, message).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message,
  });

const optionalNumericString = (message: string) =>
  z
    .string()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message,
    })
    .optional();

export const variantAttributeSchema = z.object({
  key: z.string().min(1, "Pick or enter an attribute name"),
  value: z.string().min(1, "Value is required"),
});

export const productVariantSchema = z.object({
  // Present when editing an existing variant; absent on a newly-added row.
  id: z.number().optional(),
  price: numericString("Price must be 0 or more"),
  discount_price: optionalNumericString("Discount price must be 0 or more"),
  stock: numericString("Stock must be 0 or more"),
  sku: z.string().optional(),
  attributes: z.array(variantAttributeSchema),
  // Client-only — a new file to upload, and/or the existing image's preview
  // URL. Neither is sent as JSON; onSubmit reads imageFile directly.
  imageFile: z.instanceof(File).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Select a category"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  tags: z.string().optional(),
  variants: z.array(productVariantSchema).min(1, "Add at least one variant"),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export type ProductVariantFormValue = z.infer<typeof productVariantSchema>;
export type ProductFormValues = z.infer<typeof productSchema>;
