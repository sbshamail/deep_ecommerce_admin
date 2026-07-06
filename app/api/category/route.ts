import { NextResponse } from "next/server";

import { ApiError, backendFetch } from "@/lib/api/server";
import { CategoryTreeNode } from "@/types/product_types";

// GET /category/list is public on the backend (no auth dependency), so this
// just forwards through without a token. Returns the full category tree —
// the product form flattens it client-side to leaf-only options.
export async function GET() {
  try {
    const categories = await backendFetch<CategoryTreeNode[]>("/category/list?limit=500");
    return NextResponse.json({ categories });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to load categories";
    return NextResponse.json({ detail }, { status });
  }
}
