import { NextResponse } from "next/server";

import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedEnvelope, backendFetch } from "@/lib/api/server";
import { CategoryRead, CategoryTreeNode } from "@/types/product_types";

// GET /category/list is public on the backend (no auth dependency), so this
// just forwards through without a token. Returns the full category tree —
// the CategoryPicker and CategoryTable both slice it client-side.
export async function GET() {
  try {
    const categories = await backendFetch<CategoryTreeNode[]>(
      "/category/list?limit=500",
    );
    return NextResponse.json({ categories });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail =
      err instanceof ApiError ? err.message : "Failed to load categories";
    return NextResponse.json({ detail }, { status });
  }
}

// POST /category/create — multipart/form-data, forwarded unchanged.
export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token)
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();

  try {
    // Forward the backend's { success, detail, data } envelope + status
    // verbatim so the client sees the real message and created record.
    const { status, envelope } = await authorizedEnvelope<CategoryRead>(
      "/category/create",
      token,
      { method: "POST", body: formData },
    );
    return NextResponse.json(envelope, { status });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail =
      err instanceof ApiError ? err.message : "Failed to create category";
    return NextResponse.json({ detail }, { status });
  }
}
