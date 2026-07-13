import { NextResponse } from "next/server";

import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedFetch } from "@/lib/api/server";
import { CategoryRead } from "@/types/product_types";

// PUT /category/update/{id} — multipart/form-data, forwarded unchanged.
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();

  try {
    const category = await authorizedFetch<CategoryRead>(`/category/update/${id}`, token, {
      method: "PUT",
      body: formData,
    });
    return NextResponse.json({ detail: "Category updated", category });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to update category";
    return NextResponse.json({ detail }, { status });
  }
}

// DELETE /category/delete/{id} — backend blocks this (400) if the category
// has children or assigned products; that message is surfaced as-is.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const { id } = await params;

  try {
    await authorizedFetch(`/category/delete/${id}`, token, { method: "DELETE" });
    return NextResponse.json({ detail: "Category deleted" });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to delete category";
    return NextResponse.json({ detail }, { status });
  }
}
