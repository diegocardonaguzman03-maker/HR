import { NextResponse, type NextRequest } from "next/server";
import { authConfig, devOpenMode, SESSION_COOKIE, verifySessionToken } from "@/server/auth";

export async function middleware(req: NextRequest) {
  const cfg = authConfig();
  if (!cfg.configured) {
    if (devOpenMode()) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }
  if (await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value, cfg.secret)) return NextResponse.next();
  const url = new URL("/login", req.url);
  if (req.nextUrl.pathname !== "/") url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/((?!login(?:/|$)|api/engine/tick$|_next/static|_next/image|favicon.ico|icon.svg).*)"] };
