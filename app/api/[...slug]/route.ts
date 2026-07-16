import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getAccessToken } from "@/auth/session";
import { backendEnvelope } from "@/lib/api/server";

/**
 * Generic pass-through proxy: /api/<slug> → FastAPI's /<slug>, same method,
 * same body, same query string. The slug IS the real backend path — e.g.
 * `/api/category/create` calls backend `/category/create`,
 * `/api/product/update/5` calls backend `/product/update/5`.
 *
 * Why this exists instead of one route.ts file per resource: every one of
 * those files was doing the exact same thing (attach token if present,
 * forward body, wrap the { success, detail, data } envelope). The backend
 * is already the source of truth for what routes exist — we don't need to
 * re-declare that shape on the frontend too.
 *
 * A more specific file (e.g. app/api/product/[id]/route.ts) always wins over
 * this catch-all for the same path — that's plain Next.js routing, verified
 * live, not something this file has to account for. So if one resource ever
 * needs custom behavior (extra query defaults, setting a cookie, etc.), just
 * add its own route.ts next to this one and it takes over automatically.
 *
 * ALLOWED_RESOURCES is the actual security boundary: only these top-level
 * backend resources are reachable through this proxy at all. Auth itself is
 * still enforced by the backend per-endpoint (this just attaches the token
 * when one exists and lets the backend decide if it's required).
 */
const ALLOWED_RESOURCES = ["category", "product"];

async function proxy(request: NextRequest, slugParts: string[]) {
  const [resource, ...rest] = slugParts;
  if (!ALLOWED_RESOURCES.includes(resource)) {
    return NextResponse.json({ detail: "Not found" }, { status: 404 });
  }

  const backendPath = `/${resource}${rest.length ? `/${rest.join("/")}` : ""}${request.nextUrl.search}`;

  const token = await getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const hasBody = !["GET", "HEAD"].includes(request.method);
  if (hasBody) {
    // Forward the exact bytes + content-type (multipart boundary and all) —
    // this works for both JSON and file-uploading forms without needing to
    // know which one it is.
    const contentType = request.headers.get("content-type");
    if (contentType) headers["content-type"] = contentType;
  }

  try {
    const { status, envelope } = await backendEnvelope(backendPath, {
      method: request.method,
      headers,
      body: hasBody ? await request.blob() : undefined,
    });
    return NextResponse.json(envelope, { status });
  } catch {
    return NextResponse.json(
      { detail: "Failed to reach backend" },
      { status: 502 },
    );
  }
}

interface RouteParams {
  params: Promise<{ slug: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function POST(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return proxy(request, (await params).slug);
}
