import { NextResponse } from "next/server";

function getBackendBase() {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  return url ? url.trim().replace(/\/+$/, "") : "http://localhost:5000";
}

/**
 * Proxy handler for all /api/user/* routes (e.g. /api/user/me)
 * Forwards requests directly to backend service with JWT and session headers.
 */
async function proxyUserRequest(request, { params }) {
  const backendBase = getBackendBase();

  if (!backendBase) {
    return NextResponse.json(
      {
        success: false,
        message: "Backend URL is not configured. Please define BACKEND_URL or NEXT_PUBLIC_API_URL in .env.local",
      },
      { status: 503 }
    );
  }

  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const path = pathParts.join("/");
  const url = new URL(request.url);

  // Target primary backend route: /api/user/{path}
  const targetUrl = `${backendBase}/api/user/${path}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!["host", "connection", "content-length"].includes(lower)) {
      headers.set(key, value);
    }
  });

  let body = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
      const buffer = await request.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        body = Buffer.from(buffer);
      }
    } catch {
      // Body empty or unreadable
    }
  }

  try {
    let res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
    });

    // If backend mounts user routes under /api/v1/user/*, fallback transparently
    if (res.status === 404) {
      const fallbackUrl = `${backendBase}/api/v1/user/${path}${url.search}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: request.method,
        headers,
        body,
        redirect: "manual",
        cache: "no-store",
      }).catch(() => null);

      if (fallbackRes && fallbackRes.ok) {
        res = fallbackRes;
      }
    }

    const responseData = await res.arrayBuffer();
    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!["content-encoding", "content-length", "transfer-encoding"].includes(lower)) {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(responseData, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        message: `Backend proxy connection error to ${targetUrl}: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyUserRequest;
export const POST = proxyUserRequest;
export const PUT = proxyUserRequest;
export const PATCH = proxyUserRequest;
export const DELETE = proxyUserRequest;
export const OPTIONS = proxyUserRequest;
