// Server-only helpers for calling the FastAPI backend.
// Do not import this from a "use client" file — it's meant for
// Route Handlers, Server Components, and Server Actions only.

export const BACKEND_API_URL =
  process.env.BACKEND_API_URL ?? "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls the FastAPI backend and normalizes both response shapes it can return:
 *  - success envelope: { success, detail, data, total? } → unwraps to `data`
 *  - error envelope: raised HTTPException → { detail } → thrown as ApiError
 *  - a few endpoints (e.g. /user/me) return a raw body with no envelope —
 *    those pass through unchanged since there's no `.data` key to unwrap.
 */
export async function backendFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_API_URL}${path}`, init);
  const payload = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.detail ?? payload?.message ?? "Request failed",
    );
  }

  return (payload && typeof payload === "object" && "data" in payload
    ? payload.data
    : payload) as T;
}

export async function authorizedFetch<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  return backendFetch<T>(path, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });
}
