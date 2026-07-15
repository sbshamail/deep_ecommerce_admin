import { NextResponse } from "next/server";

import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedEnvelope, backendFetch } from "@/lib/api/server";
import { ProductSingleRead } from "@/types/product_types";

// GET /product/read/{id} is public on the backend (no auth dependency).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const product = await backendFetch<ProductSingleRead>(`/product/read/${id}`, {
      cache: "no-store",
    });
    return NextResponse.json({ product });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to load product";
    return NextResponse.json({ detail }, { status });
  }
}

// POST /product/update/{id} — multipart/form-data, forwarded unchanged.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const { id } = await params;
  const formData = await request.formData();

  try {
    const { status, envelope } = await authorizedEnvelope<ProductSingleRead>(
      `/product/update/${id}`,
      token,
      { method: "POST", body: formData },
    );
    return NextResponse.json(envelope, { status });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to update product";
    return NextResponse.json({ detail }, { status });
  }
}
