import { NextResponse } from "next/server";

export function middleware(request) {
  const { method, nextUrl } = request;
  const time = new Date().toLocaleTimeString();
  const referer = request.headers.get("referer") || "direct";

  // Distinguish between API calls and Page navigations
  if (nextUrl.pathname.startsWith("/api/")) {
    console.log(
      `\x1b[36m[API REQUEST]\x1b[0m ${time} | \x1b[33m${method}\x1b[0m ${nextUrl.pathname}${nextUrl.search} (From: ${referer})`
    );
  } else {
    console.log(
      `\x1b[32m[PAGE VISIT]\x1b[0m  ${time} | \x1b[33m${method}\x1b[0m ${nextUrl.pathname} (Referer: ${referer})`
    );
  }

  return NextResponse.next();
}

// Ignore static asset noise like _next/static, images, fonts, favicon
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
