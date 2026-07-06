import { z } from "zod";

const numericString = (message: string) =>
  z.string().min(1, message).refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, {
    message,
  });

export const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  category_id: z.string().min(1, "Select a category"),
  is_active: z.boolean(),
  is_featured: z.boolean(),
  tags: z.string().optional(),
  price: numericString("Price must be 0 or more"),
  discount_price: z
    .string()
    .refine((v) => v === "" || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: "Discount price must be 0 or more",
    })
    .optional(),
  stock: numericString("Stock must be 0 or more"),
  sku: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
