import { NextResponse } from "next/server";

import { getAccessToken } from "@/auth/session";
import { ApiError, authorizedEnvelope, authorizedFetchList } from "@/lib/api/server";
import { ProductRead, ProductSingleRead } from "@/types/product_types";

// GET /product/my-products — shop-scoped, requires product:create or
// product:read. The table paginates/filters client-side (see
// components/cui/table), so this asks for a high limit up front.
export async function GET(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const search = new URL(request.url).searchParams;
  search.set("limit", search.get("limit") ?? "200");

  try {
    const { data, total } = await authorizedFetchList<ProductRead>(
      `/product/my-products?${search.toString()}`,
      token,
      { cache: "no-store" },
    );
    return NextResponse.json({ products: data, total });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to load products";
    return NextResponse.json({ detail }, { status });
  }
}

// POST /product/create — multipart/form-data, forwarded through unchanged so
// the thumbnail file and JSON-encoded tags/variant_data survive the hop.
export async function POST(request: Request) {
  const token = await getAccessToken();
  if (!token) return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });

  const formData = await request.formData();

  try {
    const { status, envelope } = await authorizedEnvelope<ProductSingleRead>(
      "/product/create",
      token,
      { method: "POST", body: formData },
    );
    return NextResponse.json(envelope, { status });
  } catch (err) {
    const status = err instanceof ApiError ? err.status : 500;
    const detail = err instanceof ApiError ? err.message : "Failed to create product";
    return NextResponse.json({ detail }, { status });
  }
}
