import { NextResponse } from "next/server";

const rawBackend =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL;

const BACKEND_BASE = rawBackend.startsWith("http")
  ? rawBackend
  : `http://${rawBackend}`;

async function proxyRequest(request, { params }) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path || [];
  const path = pathParts.join("/");
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_BASE}/api/auth/${path}${url.search}`;
  console.log(`\x1b[35m[BACKEND PROXY]\x1b[0m ${request.method} ${url.pathname} ➜ ${targetUrl}`);

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Avoid forwarding host or content-length that might clash
    const lower = key.toLowerCase();
    if (!["host", "connection", "content-length"].includes(lower)) {
      headers.set(key, value);
    }
  });

  let body = undefined;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    try {
      body = await request.text();
    } catch {
      // body empty or unreadable
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseData = await res.text();
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
    console.error(`\x1b[31m[BACKEND PROXY FAILED]\x1b[0m ${targetUrl} - ${err.message}`);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to proxy to backend at ${BACKEND_BASE}: ${err.message}`,
      },
      { status: 502 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
