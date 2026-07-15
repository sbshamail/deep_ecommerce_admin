import { NextResponse } from "next/server";

import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedEnvelope } from "@/lib/api/server";
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
    const { status, envelope } = await authorizedEnvelope<CategoryRead>(
      `/category/update/${id}`,
      token,
      { method: "PUT", body: formData },
    );
    return NextResponse.json(envelope, { status });
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
    const { status, envelope } = await authorizedEnvelope(
      `/category/delete/${id}`,
      token,
      { method: "DELETE" },
    );
    return NextResponse.json(envelope, { status });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to delete category";
    return NextResponse.json({ detail }, { status });
  }
}
